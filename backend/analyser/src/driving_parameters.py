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
        """Calculate average fuel consumption in L/100 km."""
        # Required columns
        required_cols = {"InjFlow", "Revs", "Speed"}
        if not required_cols.issubset(self.csv.columns):
            return None

        if self.csv[["InjFlow", "Revs", "Speed"]].dropna().empty:
            return None

        diesel_density = 0.8375  # kg/L for diesel fuel
        cylinders = 4  # TODO: calculate from number of injectors

        try:
            self.csv["FuelFlow_mg_per_min"] = (
                self.csv["InjFlow"] * self.csv["Revs"] * (cylinders / 2)
            )

            self.csv["FuelFlow_L_per_min"] = (
                self.csv["FuelFlow_mg_per_min"] / 1e6
            ) / diesel_density

            self.csv["FuelConsumption_L_per_100km"] = (
                (self.csv["FuelFlow_L_per_min"] * 60) / self.csv["Speed"] * 100
            )

            self.csv["FuelConsumption_L_per_100km"] = self.csv[
                "FuelConsumption_L_per_100km"
            ].replace([float("inf"), -float("inf")], None)

            avg_fuel = self.csv["FuelConsumption_L_per_100km"].mean(skipna=True)
            return float(round(avg_fuel, 2)) if not pd.isna(avg_fuel) else None

        except Exception:
            return None

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
    file_path = "backend/analyser/data/DCM62v2_20250328.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    numeric_columns = ["Revs", "Speed", "InjFlow", "AccelPedalPos"]
    for col in numeric_columns:
        if col in csv.columns:
            csv[col] = pd.to_numeric(csv[col], errors="coerce")
    filtered_csv = csv[numeric_columns].copy()

    drivingParameters = DrivingParameters(filtered_csv)
    print(drivingParameters)
