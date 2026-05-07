"""
predict.py
──────────
Load the trained GradientBoosting model, scaler, label encoder, and feature
columns to run inference on user input.

Returns:
    (score: float, category: str)
    score    → mapped to 1-3 range (probability-weighted)
    category → 'Weak' | 'Moderate' | 'Strong'
"""

import os
import numpy as np
import pandas as pd
import joblib

# Lazily loaded artifacts
_MODEL = None
_SCALER = None
_ENCODER = None
_FEATURE_COLUMNS = None

script_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(script_dir, 'model.pkl')
SCALER_PATH = os.path.join(script_dir, 'scaler.pkl')
ENCODER_PATH = os.path.join(script_dir, 'label_encoder.pkl')
COLUMNS_PATH = os.path.join(script_dir, 'feature_columns.pkl')

# Score mapping for probability-weighted score calculation
# Maps encoded label index to score value
_CLASS_SCORE = {0: 1.0, 1: 2.0, 2: 3.0}

# Family type options (must match training data)
FAMILY_TYPES = ['Extended', 'Joint', 'Nuclear', 'Single-Parent']


def _load_artifacts():
    """Load all ML artifacts (model, scaler, encoder, feature columns)."""
    global _MODEL, _SCALER, _ENCODER, _FEATURE_COLUMNS

    if _MODEL is None:
        for path, name in [
            (MODEL_PATH, 'Model'),
            (SCALER_PATH, 'Scaler'),
            (ENCODER_PATH, 'Label encoder'),
            (COLUMNS_PATH, 'Feature columns'),
        ]:
            if not os.path.exists(path):
                raise FileNotFoundError(
                    f"{name} file not found at {path}. "
                    "Run 'python ml_engine/train_model.py' first."
                )

        _MODEL = joblib.load(MODEL_PATH)
        _SCALER = joblib.load(SCALER_PATH)
        _ENCODER = joblib.load(ENCODER_PATH)
        _FEATURE_COLUMNS = joblib.load(COLUMNS_PATH)

    return _MODEL, _SCALER, _ENCODER, _FEATURE_COLUMNS


def run_prediction(parent_age: int, child_age: int, family_type: str,
                   answers: list) -> tuple:
    """
    Run ML prediction on user questionnaire input.

    Args:
        parent_age: Parent's age (integer)
        child_age:  Child's age (integer)
        family_type: One of 'Joint', 'Single-Parent', 'Extended', 'Nuclear'
        answers: list of 10 or 20 integers (Likert 1-5)
                 - 10 items: parent questions pq1…pq10
                 - 20 items: parent pq1…pq10 + child cq1…cq20

    Returns:
        (score, category): e.g. (2.74, 'Strong')
        score is probability-weighted in 1.0–3.0 range
    """
    if len(answers) not in (10, 20):
        raise ValueError(f"Expected 10 or 20 answers, got {len(answers)}")

    model, scaler, encoder, feature_columns = _load_artifacts()

    # Calculate total score from answers
    total_score = sum(answers)

    # Parent question names (pq1-pq10)
    parent_question_names = [
        "Do you try to understand your child's point of view before responding?",
        "Do you pay full attention when your child shares problems or feelings?",
        "Do you express your emotions clearly and respectfully to your child?",
        "Do you control your anger or frustration during conversations with your child?",
        "Do you spend quality time talking with your child daily?",
        "Do you praise or encourage your child's efforts and achievements?",
        "Do you listen without interrupting when your child is speaking?",
        "Do you discuss daily activities or school events with your child?",
        "Do you set clear and consistent boundaries while remaining respectful?",
        "Do you apologize to your child when you are wrong?",
    ]

    # Child question names (cq1-cq10)
    child_question_names = [
        "Does your child try to understand your point of view before responding?",
        "Does your child pay full attention when you share problems or feelings?",
        "Does your child express emotions clearly and respectfully to you?",
        "Does your child control anger or frustration during conversations with you?",
        "Does your child spend quality time talking with you daily?",
        "Does your child praise or encourage your efforts and achievements?",
        "Does your child listen without interrupting when you are speaking?",
        "Does your child discuss daily activities or school/office events with you?",
        "Does your child follow your rules and expectations?",
        "Does your child apologize to you when they are wrong?",
    ]

    # Build feature dict
    feature_dict = {
        'Parent Age': parent_age,
        'Child Age': child_age,
        'Total Score': total_score,
    }

    # Add parent question answers
    parent_answers = answers[:10]
    for name, val in zip(parent_question_names, parent_answers):
        feature_dict[name] = val

    # Add child question answers (if available)
    if len(answers) == 20:
        child_answers = answers[10:]
        for name, val in zip(child_question_names, child_answers):
            feature_dict[name] = val

    # One-hot encode Family Type (same approach as pd.get_dummies)
    for ft in FAMILY_TYPES:
        col_name = f'Family Type_{ft}'
        feature_dict[col_name] = 1 if family_type == ft else 0

    # Create DataFrame with the exact feature columns used during training
    df = pd.DataFrame([feature_dict])

    # Ensure all training columns are present (fill missing with 0)
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0

    # Reorder to match training column order
    df = df[feature_columns]

    # Scale features. Keep this as a DataFrame so sklearn sees the same
    # feature names that were used when the scaler was fitted.
    X = scaler.transform(df)

    # Predict
    pred_class = int(model.predict(X)[0])
    pred_proba = model.predict_proba(X)[0]  # shape (n_classes,)

    # Probability-weighted score (mapped to 1-3 range)
    # The encoder maps: Moderate=0, Strong=1, Weak=2 (alphabetical)
    # We need to map each class to its score
    classes = list(encoder.classes_)  # e.g., ['Moderate', 'Strong', 'Weak']
    score_map = {'Weak': 1.0, 'Moderate': 2.0, 'Strong': 3.0}

    score = 0.0
    for i, cls_name in enumerate(classes):
        score += pred_proba[i] * score_map.get(cls_name, 2.0)

    # Clamp to [1, 3]
    score = max(1.0, min(3.0, score))

    # Get predicted category name
    category = encoder.inverse_transform([pred_class])[0]

    return float(round(score, 2)), category
