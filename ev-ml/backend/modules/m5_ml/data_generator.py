
import pandas as pd
import numpy as np
import os
from backend.modules.m4_energy import compute_range_km

def generate_trips(n=200):
    # Set seed for reproducibility
    np.random.seed(42)

    # 1. Feature Generation
    data = {
        "soc": np.random.uniform(0.08, 1.0, n),
        "soh": np.random.uniform(0.8, 1.0, n),
        "cell_delta_mv": np.clip(np.random.normal(5, 3, n), 0, 50),
        "battery_temp_c": np.clip(np.random.normal(25, 10, n), -10, 45),
        "ambient_temp_c": np.clip(np.random.normal(15, 12, n), -20, 40),
        "headwind_ms": np.random.normal(0, 3, n),
        "precipitation_mm": np.random.uniform(0, 5, n),
        "avg_gradient_deg": np.clip(np.random.normal(0, 2, n), -8, 8),
        "elevation_gain_m": np.clip(np.random.normal(50, 100, n), 0, 500),
        "regen_opportunity_pct": np.random.uniform(0, 0.5, n),
        "cargo_mass_kg": np.random.uniform(0, 100, n),
        "passenger_count": np.random.randint(1, 6, n), # 1 to 5
        "driver_aggression": np.clip(np.random.normal(1.0, 0.2, n), 0.5, 2.0),
        "hvac_usage": np.random.uniform(0, 1, n),
        "avg_highway_speed": np.clip(np.random.normal(90, 15, n), 60, 130),
        "time_of_day": np.random.randint(0, 24, n)
    }

    df = pd.DataFrame(data)

    df["hvac_usage"] = np.where(
        (df["ambient_temp_c"] < 10) | (df["ambient_temp_c"] > 28),
        np.random.uniform(0.6, 1.0, n),
        np.random.uniform(0.0, 0.4, n)
    )

    rolling_resistance = 1.0 + (df["precipitation_mm"] * 0.02) # Rain increases drag

    # 2. Derived Route Types
    df["route_type_highway"] = (df["avg_highway_speed"] > 85).astype(int)
    df["route_type_urban"] = (df["avg_highway_speed"] < 65).astype(int)
    df["route_type_rural"] = ((df["avg_highway_speed"] >= 65) & (df["avg_highway_speed"] <= 85)).astype(int)

    # 3. Physics Baseline Calculation
    # Note: speed_ms is km/h / 3.6
    df["physics_range_km"] = df.apply(
        lambda row: compute_range_km(
            soc=row["soc"],
            soh=row["soh"],
            speed_ms=row["avg_highway_speed"] / 3.6,
            gradient_deg=row["avg_gradient_deg"],
            ambient_temp_c=row["ambient_temp_c"],
            hvac_on=row["hvac_usage"] > 0.5
        ), axis=1
    )


    # 4. Target Variables
    # Logic: actual_range is physics influenced by aggression, imbalance, and noise
    # (Note: Following the specific formula provided where aggression scales the range)

    noise = np.random.normal(0, 5, n) * np.sqrt(df["soc"])
    df["actual_range_km"] = (
        (df["physics_range_km"] / (1 + (df["driver_aggression"] - 1) * 0.3)) # Dampened aggression
        * (1 - df["cell_delta_mv"] * 0.002) 
        / rolling_resistance
        + noise
    ).clip(lower=0)

    df["epsilon"] = df["actual_range_km"] - df["physics_range_km"]

    # 5. Save to CSV
    # Ensure directory exists
    print(df["actual_range_km"].describe())
    print(df["epsilon"].describe())
    output_path = "backend/data/trips.csv"
    df_save = df.drop(columns=["physics_range_km"])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_save.to_csv(output_path, index=False)

    # df.to_csv(output_path, index=False)

    
    return df

if __name__ == "__main__":
    trips_df = generate_trips(200)
    print(f"Dataset generated. Shape: {trips_df.shape}")
    print("-" * 30)
    print(trips_df.head(3).to_string())