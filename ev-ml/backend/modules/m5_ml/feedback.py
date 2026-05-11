
import sqlite3
import json
import time
import os
import pandas as pd
import joblib
import xgboost as xgb

DB_PATH = "backend/data/feedback.db"
MODEL_PATH = "backend/data/model.pkl"
FEATURES_JSON_PATH = "backend/data/feature_columns.json"

def init_db() -> None:
    """Initializes the SQLite database and required tables."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create trips table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            features_json TEXT,
            epsilon REAL,
            timestamp INTEGER
        )
    """)
    
    # Create retrain_log table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS retrain_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            sample_count INTEGER
        )
    """)
    
    conn.commit()
    conn.close()

def save_trip(features: dict, epsilon: float) -> None:
    """Inserts a single trip record into the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO trips (features_json, epsilon, timestamp) VALUES (?, ?, ?)",
        (json.dumps(features), epsilon, int(time.time()))
    )
    
    conn.commit()
    conn.close()

def retrain_if_ready(min_new_samples: int = 10) -> bool:
    """
    Checks if enough new samples exist to trigger a retrain.
    If so, it updates the model using all available data.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Calculate how many new samples have arrived since last retrain
    cursor.execute("SELECT COUNT(*) FROM trips")
    total_samples = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(sample_count) FROM retrain_log")
    res = cursor.fetchone()[0]
    samples_already_trained = res if res is not None else 0
    
    new_samples_count = total_samples - samples_already_trained

    if new_samples_count < min_new_samples:
        conn.close()
        return False

    # 2. Load all rows from trips table
    cursor.execute("SELECT features_json, epsilon FROM trips")
    rows = cursor.fetchall()
    
    # 3. Rebuild X and y
    with open(FEATURES_JSON_PATH, "r") as f:
        feature_order = json.load(f)

    features_list = []
    target_list = []
    
    for row in rows:
        feat_dict = json.loads(row[0])
        # Ensure we extract features in the exact order the model expects
        features_list.append([feat_dict.get(col, 0) for col in feature_order])
        target_list.append(row[1])

    X = pd.DataFrame(features_list, columns=feature_order)
    y = pd.Series(target_list)

    # 4. Load current model and retrain
    # Note: We create a fresh model instance to avoid carry-over state issues 
    # depending on XGBoost version, though model.fit usually overwrites.
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        random_state=42
    )
    
    model.fit(X, y)

    # 5. Save updated model
    joblib.dump(model, MODEL_PATH)

    # 6. Log the retraining event
    cursor.execute(
        "INSERT INTO retrain_log (timestamp, sample_count) VALUES (?, ?)",
        (int(time.time()), new_samples_count)
    )
    
    conn.commit()
    conn.close()
    return True

if __name__ == "__main__":
    # Quick setup check
    init_db()
    print("Database initialized.")
    
    # Example usage (simulated):
    # save_trip({"soc": 0.8, "soh": 0.9, ...}, 5.2)
    # retrain_if_ready(10)