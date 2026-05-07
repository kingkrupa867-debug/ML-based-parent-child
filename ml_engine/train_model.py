"""
train_model.py
─────────────
Loads the real Parent-Child Communication Dataset (10,000+ rows),
preprocesses it following the project notebook, and trains a
GradientBoostingClassifier to predict Bond Level (Weak / Moderate / Strong).

Run once before starting the server:
    python ml_engine/train_model.py
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib

# ── Path setup ──────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(script_dir, 'Parent_Child_Communication_Dataset_10000.xlsx')
MODEL_PATH = os.path.join(script_dir, 'model.pkl')
SCALER_PATH = os.path.join(script_dir, 'scaler.pkl')
ENCODER_PATH = os.path.join(script_dir, 'label_encoder.pkl')
COLUMNS_PATH = os.path.join(script_dir, 'feature_columns.pkl')

RANDOM_STATE = 42
MIN_EXPECTED_ACCURACY = 0.98


def load_and_clean_dataset() -> pd.DataFrame:
    """
    Load the Excel dataset and replicate the notebook preprocessing:
    - Read with header=1
    - Rename question columns from rows 10004-10014
    - Drop duplicates and NaN rows
    - Drop Respondent ID
    """
    print("Loading dataset from:", DATASET_PATH)
    df = pd.read_excel(DATASET_PATH, header=1)

    # Rename question columns using the question text stored in rows 10004-10014
    new_cols = df["Parent Age"].iloc[10004:10014].values
    cols = list(df.columns)
    cols[4:14] = new_cols
    df.columns = cols

    print(f"  Raw dataset shape: {df.shape}")

    # Drop duplicates and NaN
    df = df.drop_duplicates()
    df.dropna(inplace=True)
    print(f"  After cleaning: {df.shape}")

    # Drop Respondent ID
    df.drop(columns=["Respondent ID"], inplace=True)

    return df


def preprocess(df: pd.DataFrame):
    """
    Preprocess the dataset:
    - Convert numeric columns
    - One-hot encode Family Type
    - Label encode Bond Level
    - StandardScaler on features
    """
    # Convert columns to numeric (except Family Type and Bond Level)
    cols_to_convert = df.columns.difference(['Family Type', 'Bond Level'])
    df[cols_to_convert] = df[cols_to_convert].apply(pd.to_numeric, errors='coerce')
    df[cols_to_convert] = df[cols_to_convert].astype('Int64')

    # One-hot encode Family Type
    df = pd.get_dummies(df, columns=['Family Type'])

    # Label encode Bond Level
    le = LabelEncoder()
    df['Bond Level'] = le.fit_transform(df['Bond Level'])

    # Convert all to int
    df = df.astype(int)

    # Split features and target
    X = df.drop('Bond Level', axis=1)
    y = df['Bond Level']

    # Store feature column names for prediction
    feature_columns = list(X.columns)

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler, le, feature_columns


def train():
    print("=" * 60)
    print("Parent-Child Communication Quality — Model Training")
    print("Using: GradientBoostingClassifier with Real Dataset")
    print("=" * 60, "\n")

    # 1. Load and clean data
    df = load_and_clean_dataset()
    print(f"\nDataset shape: {df.shape}")
    print("Columns:", list(df.columns), "\n")

    # 2. Preprocess
    X, y, scaler, le, feature_columns = preprocess(df)

    print(f"Feature matrix shape: {X.shape}")
    print(f"Label classes: {list(le.classes_)}")
    print(f"Class distribution:\n{pd.Series(y).value_counts().to_string()}\n")

    # 3. Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    # 4. Train GradientBoostingClassifier
    print("Training GradientBoostingClassifier...")
    gb = GradientBoostingClassifier(
        n_estimators=100,
        random_state=RANDOM_STATE,
    )
    gb.fit(X_train, y_train)

    # 5. Evaluate
    y_pred = gb.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {acc:.4f}\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=list(le.classes_)))

    if acc < MIN_EXPECTED_ACCURACY:
        raise RuntimeError(
            f"Model accuracy {acc:.4f} is below the required "
            f"{MIN_EXPECTED_ACCURACY:.2%} threshold."
        )

    # 6. Save all artifacts
    joblib.dump(gb, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")

    joblib.dump(scaler, SCALER_PATH)
    print(f"Scaler saved to: {SCALER_PATH}")

    joblib.dump(le, ENCODER_PATH)
    print(f"Label encoder saved to: {ENCODER_PATH}")

    joblib.dump(feature_columns, COLUMNS_PATH)
    print(f"Feature columns saved to: {COLUMNS_PATH}")

    print("\nTraining complete! All artifacts saved.")


if __name__ == '__main__':
    train()
