"""
Severity Engine
Inputs: toxicity_score, is_threat, prior_violations
Output: score 0-100 + level label
"""


def calculate_severity(toxicity_score: float, is_threat: bool = False, prior_violations: int = 0) -> dict:
    base = toxicity_score * 70
    threat_bonus = 20 if is_threat else 0
    repeat_bonus = min(prior_violations * 3, 10)
    score = min(round(base + threat_bonus + repeat_bonus, 1), 100)

    if score <= 30:
        level = "Safe"
    elif score <= 60:
        level = "Moderate"
    elif score <= 80:
        level = "High"
    else:
        level = "Critical"

    return {"severity_score": score, "severity_level": level}


def is_critical(severity_level: str) -> bool:
    return severity_level == "Critical"


def is_threat_category(category: str) -> bool:
    return category in ["threat", "severe_toxic"]
