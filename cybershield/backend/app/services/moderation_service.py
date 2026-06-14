"""
AI Moderation Service
Uses unitary/toxic-bert via HuggingFace pipeline.
Falls back to keyword-based scoring if model unavailable.
"""
from typing import Optional
import logging

logger = logging.getLogger(__name__)

_pipeline = None

CATEGORY_KEYWORDS = {
    "threat": ["kill", "hurt", "attack", "stab", "shoot", "die", "murder", "destroy"],
    "hate_speech": ["hate", "racist", "slur", "bigot", "nazi", "inferior"],
    "harassment": ["loser", "pathetic", "worthless", "stupid", "idiot", "moron", "ugly"],
    "insult": ["dumb", "trash", "garbage", "freak", "disgusting"],
    "profanity": ["fuck", "shit", "bitch", "asshole", "bastard", "crap"],
    "toxic": ["terrible", "awful", "worst", "horrible"],
}


def _load_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    try:
        from transformers import pipeline
        _pipeline = pipeline(
            "text-classification",
            model="unitary/toxic-bert",
            top_k=None,
            truncation=True,
            max_length=512,
        )
        logger.info("Loaded unitary/toxic-bert")
    except Exception as e:
        logger.warning(f"Could not load toxic-bert: {e}. Using keyword fallback.")
        _pipeline = "fallback"
    return _pipeline


def _keyword_score(text: str) -> dict:
    text_lower = text.lower()
    detected_category = "safe"
    max_score = 0.0

    for category, keywords in CATEGORY_KEYWORDS.items():
        hits = sum(1 for k in keywords if k in text_lower)
        if hits:
            score = min(hits * 0.3, 1.0)
            if score > max_score:
                max_score = score
                detected_category = category

    return {
        "toxicity_score": round(max_score, 3),
        "category": detected_category if max_score > 0 else "safe",
        "confidence": round(max_score, 3),
    }


def classify_text(text: str) -> dict:
    """
    Returns: { toxicity_score: float, category: str, confidence: float }
    """
    if not text or not text.strip():
        return {"toxicity_score": 0.0, "category": "safe", "confidence": 1.0}

    pipe = _load_pipeline()

    if pipe == "fallback":
        return _keyword_score(text)

    try:
        results = pipe(text[:512])[0]
        label_map = {r["label"].lower(): r["score"] for r in results}

        toxic_score = label_map.get("toxic", 0.0)
        threat_score = label_map.get("threat", 0.0)
        insult_score = label_map.get("insult", 0.0)
        identity_hate = label_map.get("identity_hate", 0.0)
        obscene = label_map.get("obscene", 0.0)
        severe_toxic = label_map.get("severe_toxic", 0.0)

        scores = {
            "threat": threat_score,
            "hate_speech": identity_hate,
            "harassment": insult_score,
            "profanity": obscene,
            "toxic": toxic_score,
            "severe_toxic": severe_toxic,
        }

        top_category = max(scores, key=scores.get)
        top_score = scores[top_category]

        overall = max(toxic_score, severe_toxic * 0.9, threat_score * 0.95)

        if top_score < 0.2:
            top_category = "safe"

        return {
            "toxicity_score": round(overall, 3),
            "category": top_category,
            "confidence": round(top_score, 3),
        }
    except Exception as e:
        logger.error(f"Moderation error: {e}")
        return _keyword_score(text)
