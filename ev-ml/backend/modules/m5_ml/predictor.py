
import joblib
import json
import os
import numpy as np

MODEL_PATH = "backend/data/model.pkl"
FEATURES_PATH = "backend/data/feature_columns.json"
SCALER_PATH = "backend/data/scaler.pkl"

_model = None
_features = None
_scaler = None

def load_resources():
    global _model, _features, _scaler
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError("Model file not found. Please run trainer.py first.")
    
    if _features is None:
        if os.path.exists(FEATURES_PATH):
            with open(FEATURES_PATH, "r") as f:
                _features = json.load(f)
        else:
            raise FileNotFoundError("Feature columns JSON not found.")

    if _scaler is None:
        if os.path.exists(SCALER_PATH):
            _scaler = joblib.load(SCALER_PATH)
        else:
            raise FileNotFoundError("Scaler file not found. Please run trainer.py first.")

def predict(feature_dict: dict) -> float:
    """
    Predicts the epsilon (range correction) based on input features.
    """
    load_resources()
    
    # Construct the feature vector in the exact order the model expects
    vector = []
    for col in _features:
        # Default to 0 if a feature is somehow missing
        vector.append(feature_dict.get(col, 0.0))

    # Reshape and scale with the same scaler used during training.
    vector_array = np.array([vector], dtype=float)
    scaled_vector = _scaler.transform(vector_array)
    prediction = _model.predict(scaled_vector)
    return float(prediction[0])