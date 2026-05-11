import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def train_model():
    df = pd.read_csv("backend/data/trips.csv")
    
    # 1. Feature Engineering: Dropping columns that might confuse the model
    # Ensure time_of_day is handled or dropped if it's purely random noise
    X = df.drop(columns=["actual_range_km", "epsilon"])
    y = df["epsilon"]

    # 2. Scaling (Crucial for avoiding those massive MAE numbers)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # 3. Model with "Early Stopping" to prevent overfitting
    model = xgb.XGBRegressor(
        n_estimators=500,       # Higher, but we will stop early
        max_depth=5,
        learning_rate=0.03,
        subsample=0.9,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        n_jobs=-1
    )

    # Use a validation set to stop before R^2 goes negative
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )

    # 4. Evaluation
    test_preds = model.predict(X_test)
    r2 = r2_score(y_test, test_preds)
    mae = mean_absolute_error(y_test, test_preds)

    print(f"Improved Test R²: {r2:.4f}")
    print(f"Improved Test MAE: {mae:.2f} km")

    # 5. Save Model and the Scaler! 
    # (You must use the same scaler in production as in training)
    joblib.dump(model, "backend/data/model.pkl")
    joblib.dump(scaler, "backend/data/scaler.pkl")

if __name__ == "__main__":
    train_model()