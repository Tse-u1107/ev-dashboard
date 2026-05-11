
import math
import math

def compute_range_km(
    soc: float,
    soh: float = 1.0,
    speed_ms: float = 0.0,
    gradient_deg: float = 0.0,
    ambient_temp_c: float = 20.0,
    hvac_on: bool = False,
    rolling_resistance_factor: float = 1.0
) -> float:
    # Constants
    rho, Cd, A, Crr = 1.225, 0.23, 2.22, 0.01
    mass, eta, P_hvac, pack_kwh, g = 1900, 0.95, 1500, 75, 9.81

    if speed_ms <= 0.5: # 0.5 m/s floor to prevent HVAC division by zero
        return 0.0

    # 1. Forces (Newtons)
    F_drag = 0.5 * rho * Cd * A * speed_ms**2
    safe_rr_factor = max(0.6, rolling_resistance_factor)
    F_rolling = Crr * safe_rr_factor * mass * g * math.cos(math.radians(gradient_deg))
    F_gradient = mass * g * math.sin(math.radians(gradient_deg))
    F_total = F_drag + F_rolling + F_gradient

    # 2. Energy per meter (Joules/m)
    eta_regen = 0.7 
    if F_total >= 0:
        E_per_m = F_total / eta
    else:
        E_per_m = F_total * eta_regen # Negative (regeneration)

    # 3. Add HVAC
    if hvac_on:
        E_per_m += P_hvac / speed_ms

    # 4. SAFETY FLOOR (Crucial for Synthetic Data Stability)
    # 180,000 J/km is approx 50 Wh/km. This prevents E_per_m from being 0.
    E_per_m = max(E_per_m, 180.0) 

    # 5. Final Calculation
    total_energy_j = soc * soh * pack_kwh * 3_600_000
    range_m = total_energy_j / E_per_m
    
    return range_m / 1000
if __name__ == "__main__":
    # Validation test
    speed = 88 / 3.6   # 88 km/h in m/s
    result = compute_range_km(
        soc=1.0, 
        soh=1.0, 
        speed_ms=speed, 
        gradient_deg=0, 
        ambient_temp_c=20, 
        hvac_on=False
    )
    
    assert 530 < result < 630, f"Expected ~576km, got {result:.1f}km"
    print(f"Physics baseline: {result:.1f} km — PASS")