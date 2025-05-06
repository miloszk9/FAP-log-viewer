from json import dumps

import pandas as pd


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
            return {"max": None, "avg": None}

        accel = self.csv["AccelPedalPos"].dropna()
        non_zero_accel = accel[accel > 0]

        max_accel = accel.max() if not accel.empty else None
        avg_accel = non_zero_accel.mean() if not non_zero_accel.empty else None

        return {
            "max": float(round(max_accel, 2)) if max_accel is not None else None,
            "avg": float(round(avg_accel, 2)) if avg_accel is not None else None,
        }

    def _calculate_fuel(self):
        """Calculate total fuel consumption in liters and average fuel consumption in L/100 km."""
        # Required columns
        required_cols = {"InjFlow", "Revs", "Speed", "Time_Diff"}
        if not required_cols.issubset(self.csv.columns):
            return None

        if self.csv[["InjFlow", "Revs", "Speed", "Time_Diff"]].dropna().empty:
            return None

        diesel_density = 0.8375  # kg/L for diesel fuel
        cylinders = 4  # TODO: calculate from number of injectors

        # Calculate fuel in mg
        self.csv["Fuel_mg"] = (
            self.csv["InjFlow"]  # mg per stroke
            * self.csv["Revs"]
            * self.csv["Time_Diff"]
            * (cylinders)
        )

        # Convert to liters
        self.csv["Fuel_L"] = (self.csv["Fuel_mg"] / 1e8) / diesel_density

        # Calculate distance in km
        self.csv["Distance"] = (self.csv["Speed"] * self.csv["Time_Diff"]) / 3600.0
        total_distance = self.csv["Distance"].sum()
        total_fuel = self.csv["Fuel_L"].sum()

        total_fuel_per_distance = None
        if total_distance != 0:
            total_fuel_per_distance = (total_fuel / total_distance) * 100

        return {
            "liters": float(round(total_fuel, 2)),
            "per_100km": float(round(total_fuel_per_distance, 2)),
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
            return {"avg": None, "max": None, "min": None}

        speed = self.csv["Speed"].dropna()
        return {
            "avg": float(round(speed.mean(), 1)),
            "max": float(round(speed.max(), 1)),
            "min": float(round(speed.min(), 1)),
        }


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Usage: python -m data_analyser.parameters.driving_parameters
    file_path = "../data/ds4/DCM62v2_20250205.csv"
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
