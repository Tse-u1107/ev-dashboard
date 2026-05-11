
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict

from backend.modules.m4_energy import compute_range_km
from backend.modules.m5_ml import predictor
from backend.modules.m5_ml.feedback import save_trip, retrain_if_ready, init_db

app = FastAPI(title="EV Range ML API")

# Enable CORS for Expo/Mobile development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class PredictRequest(BaseModel):
    soc: float
    soh: float = 1.0
    cell_delta_mv: float = 5.0
    battery_temp_c: float = 25.0
    ambient_temp_c: float = 20.0
    headwind_ms: float = 0.0
    precipitation_mm: float = 0.0
    avg_gradient_deg: float = 0.0
    elevation_gain_m: float = 50.0
    regen_opportunity_pct: float = 0.2
    cargo_mass_kg: float = 0.0
    passenger_count: int = 1
    driver_aggression: float = 1.5
    hvac_usage: float = 0.3
    avg_highway_speed: float = 90.0
    route_type: str = "highway"  # "highway" | "urban" | "rural"
    time_of_day: int = 12
    road_quality: float = 0.8  # 0.0 (worst) to 1.0 (best)

class PredictResponse(BaseModel):
    range_km: float
    ci_low: float
    ci_high: float
    physics_range_km: float
    epsilon: float

class FeedbackRequest(BaseModel):
    features: dict
    actual_km: float
    predicted_km: float

# --- Endpoints ---

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/predict", response_model=PredictResponse)
async def predict_range(req: PredictRequest):
    quality = min(1.0, max(0.0, req.road_quality))
    rr_factor = 1.0 + (1.0 - quality) * 0.8

    # 1. Compute physics baseline
    # Note: speed_ms is km/h / 3.6
    physics_range = compute_range_km(
        soc=req.soc,
        soh=req.soh,
        speed_ms=req.avg_highway_speed / 3.6,
        gradient_deg=req.avg_gradient_deg,
        ambient_temp_c=req.ambient_temp_c,
        hvac_on=req.hvac_usage > 0.5,
        rolling_resistance_factor=rr_factor
    )

    # 2. Build feature dictionary for the ML model
    # We must match the column names generated in data_generator.py
    feature_dict = req.dict()
    
    # Handle the derived route type binary features
    feature_dict["route_type_highway"] = 1 if req.route_type == "highway" else 0
    feature_dict["route_type_urban"] = 1 if req.route_type == "urban" else 0
    feature_dict["route_type_rural"] = 1 if req.route_type == "rural" else 0
    
    # Add physics result as the final feature
    feature_dict["physics_range_km"] = physics_range
    
    # 3. Get ML correction (epsilon)
    epsilon = predictor.predict(feature_dict)
    
    # 4. Calculate final range
    range_final = max(0.0, physics_range + epsilon)

    # 5. Calculate 8% Confidence Interval
    return PredictResponse(
        range_km=round(range_final, 1),
        ci_low=round(range_final * 0.92, 1),
        ci_high=round(range_final * 1.08, 1),
        physics_range_km=round(physics_range, 1),
        epsilon=round(epsilon, 1)
    )

@app.post("/feedback")
async def submit_feedback(req: FeedbackRequest):
    # Calculate how far off the prediction was
    epsilon_actual = req.actual_km - req.predicted_km
    
    # Save trip to SQLite
    save_trip(req.features, epsilon_actual)
    
    # Check if we should trigger a retrain
    retrained = retrain_if_ready(min_new_samples=10)
    
    return {"status": "ok", "retrained": retrained}