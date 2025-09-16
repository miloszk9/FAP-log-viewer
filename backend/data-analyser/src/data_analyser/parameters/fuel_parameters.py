from json import dumps

import pandas as pd
from data_analyser.constants.common import range_labels

from .utils import calculate_fuel_consumption, calculate_total_distance


class FuelParameters:
    def __init__(self, csv):
        self.csv = csv
        self.result = {
            "overall": self._calculate_overall(),
            "bySpeedRange": self._calculate_by_speed_range(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_overall(self):
        """Calculate total fuel consumption in liters and average fuel consumption in L/100 km."""
        total_fuel = calculate_fuel_consumption(self.csv)
        total_distance = calculate_total_distance(self.csv)

        total_fuel_per_distance = None
        if total_distance > 0:
            total_fuel_per_distance = (total_fuel / total_distance) * 100

        return {
            "total_l": float(round(total_fuel, 2)) if total_fuel else None,
            "avg_l100km": float(round(total_fuel_per_distance, 2))
            if total_fuel_per_distance
            else None,
        }

    def _calculate_by_speed_range(self):
        """Advanced fuel consumption analysis by speed range, filtering out REGEN == 1."""
        # Define speed range
        speed_range = [
            (5, 15),
            (15, 25),
            (25, 35),
            (35, 45),
            (45, 55),
            (55, 65),
            (65, 75),
            (75, 85),
            (85, 95),
            (95, 105),
            (105, 115),
            (115, 125),
            (125, 135),
            (135, 145),
            (145, 155),
            (155, 165),
            (165, 175),
            (175, 185),
            (185, 195),
            (195, 200),
            (200, float("inf")),
        ]

        # Filter out REGEN == 1 if column exists
        df = self.csv.copy()
        if "REGEN" in df.columns:
            df = df[df["REGEN"] != 1]

        results = {}
        for (low, high), label in zip(speed_range, range_labels):
            range_df = df[(df["Speed"] >= low) & (df["Speed"] < high)]
            if range_df.empty:
                continue

            # Calculate total distance in this range
            # Use Time_Diff (in seconds) * Speed (in km/h) / 3600 to get distance in km for each row
            if "Time_Diff" in range_df.columns and "Speed" in range_df.columns:
                # Only consider rows where Time_Diff > 0
                valid = range_df["Time_Diff"] > 0
                distance = (
                    range_df.loc[valid, "Speed"]
                    * range_df.loc[valid, "Time_Diff"]
                    / 3600
                ).sum()
            else:
                distance = None

            # Calculate total fuel consumption in this range
            if "InjFlow" in range_df.columns and "Time_Diff" in range_df.columns:
                fuel = calculate_fuel_consumption(range_df)
            else:
                fuel = None

            # Calculate avg fuel per 100km
            avg_l100km = None
            if distance and distance > 0 and fuel is not None:
                avg_l100km = (fuel / distance) * 100

            results[f"{label}_l100km"] = (
                float(round(avg_l100km, 2)) if avg_l100km is not None else None
            )
            results[f"_{label}_km"] = (
                float(round(distance, 2)) if distance is not None else None
            )
        return results


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Usage: python -m data_analyser.parameters.fuel_parameters
    file_path = "../data/ds4/DCM62v2_20250328.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    numeric_columns = ["Revs", "Speed", "InjFlow", "AccelPedalPos"]
    for col in numeric_columns:
        if col in csv.columns:
            csv[col] = pd.to_numeric(csv[col], errors="coerce")

    csv["Datetime"] = pd.to_datetime(csv["Date"] + " " + csv["Time"], errors="coerce")
    csv = csv.sort_values("Datetime")
    csv["Time_Diff"] = csv["Datetime"].diff().dt.total_seconds().fillna(0)

    fuel_parameters = [
        "Revs",
        "Speed",
        "InjFlow",
        "AccelPedalPos",
        "Datetime",
        "Time_Diff",
    ]
    filtered_csv = csv[fuel_parameters].copy()

    fuelParameters = FuelParameters(filtered_csv)
    print(fuelParameters)
