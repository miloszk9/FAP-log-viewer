from json import dumps

import pandas as pd

from .utils import calculate_fuel_consumption, calculate_total_distance


class DrivingParameters:
    def __init__(self, csv):
        self.csv = csv
        self.result = {
            "acceleration": self._calculate_acceleration(),
            "fuelConsumption": self._calculate_fuel(),
            "revs": self._calculate_revs(),
            "speed": self._calculate_speed(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_acceleration(self):
        """Calculate acceleration pedal position statistics."""
        if (
            "AccelPedalPos" not in self.csv.columns
            or self.csv["AccelPedalPos"].dropna().empty
        ):
            return {"max_perc": None, "avg_perc": None}

        accel = self.csv["AccelPedalPos"].dropna()
        # Filter out values not between 0 and 100
        accel = accel[(accel >= 0) & (accel <= 100)]
        non_zero_accel = accel[accel > 0]

        max_accel = accel.max() if not accel.empty else None
        avg_accel = non_zero_accel.mean() if not non_zero_accel.empty else None

        return {
            "max_perc": float(round(max_accel, 2)) if max_accel is not None else None,
            "avg_perc": float(round(avg_accel, 2)) if avg_accel is not None else None,
        }

    def _calculate_fuel(self):
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

    def _calculate_revs(self):
        """Calculate engine revolution statistics."""
        if "Revs" not in self.csv.columns or self.csv["Revs"].dropna().empty:
            return {"min": None, "max": None, "avg": None, "avgDriving": None}

        revs = self.csv["Revs"].dropna()
        driving_revs = (
            self.csv["Revs"][self.csv["Speed"] > 0].dropna()
            if "Speed" in self.csv.columns
            else pd.Series()
        )

        return {
            "min": int(round(revs.min())) if not revs.empty else None,
            "max": int(round(revs.max())) if not revs.empty else None,
            "avg": int(round(revs.mean())) if not revs.empty else None,
            "avgDriving": int(round(driving_revs.mean()))
            if not driving_revs.empty
            else None,
        }

    def _calculate_speed(self):
        """Calculate average, max and min speed."""
        if "Speed" not in self.csv.columns or self.csv["Speed"].dropna().empty:
            return {"avg_kmh": None, "max_kmh": None, "min_kmh": None}

        speed = self.csv["Speed"].dropna()
        return {
            "avg_kmh": float(round(speed.mean(), 2)),
            "max_kmh": float(round(speed.max(), 2)),
            "min_kmh": float(round(speed.min(), 2)),
        }


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Usage: python -m data_analyser.parameters.driving_parameters
    file_path = "../data/ds4/DCM62v2_20250626.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    numeric_columns = ["Revs", "Speed", "InjFlow", "AccelPedalPos"]
    for col in numeric_columns:
        if col in csv.columns:
            csv[col] = pd.to_numeric(csv[col], errors="coerce")

    csv["Datetime"] = pd.to_datetime(csv["Date"] + " " + csv["Time"], errors="coerce")
    csv = csv.sort_values("Datetime")
    csv["Time_Diff"] = csv["Datetime"].diff().dt.total_seconds().fillna(0)

    driving_parameters = [
        "Revs",
        "Speed",
        "InjFlow",
        "AccelPedalPos",
        "Datetime",
        "Time_Diff",
    ]
    filtered_csv = csv[driving_parameters].copy()

    drivingParameters = DrivingParameters(filtered_csv)
    print(drivingParameters)
