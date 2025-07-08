from typing import Dict, Optional

import pandas as pd


def calculate_fuel_consumption(
    df: pd.DataFrame,
    diesel_density: float = 0.8375,
    cylinders: int = 4,
) -> Optional[Dict[str, float]]:
    """
    Calculate total fuel consumption in liters and average fuel consumption in L/100 km.
    Returns None if required columns are missing or data is insufficient.
    """
    if (
        not {"InjFlow", "Revs", "Speed", "Time_Diff"}.issubset(df.columns)
        or df[["InjFlow", "Revs", "Speed", "Time_Diff"]].dropna().empty
    ):
        return None

    # Convert Revs to revolutions per second
    revs_per_sec = df["Revs"] / 60.0
    # Number of revolutions in each interval
    revolutions = revs_per_sec * df["Time_Diff"]
    # Number of injection events (for all cylinders)
    injection_events = revolutions * (cylinders / 2)
    # Total fuel in mg
    fuel_mg = df["InjFlow"] * injection_events
    # Convert to liters
    fuel_l = (fuel_mg / 1e6) / diesel_density

    return fuel_l.sum()


def calculate_total_distance(df: pd.DataFrame) -> Optional[float]:
    """
    Calculate total distance in kilometers from a DataFrame with Speed (km/h) and Time_Diff (s).
    Returns None if columns are missing or data is insufficient.
    """
    if (
        not {"Speed", "Time_Diff"}.issubset(df.columns)
        or df[["Speed", "Time_Diff"]].dropna().empty
    ):
        return None

    distance = (df["Speed"] * df["Time_Diff"]) / 3600.0
    total_distance = distance.sum()
    return total_distance
