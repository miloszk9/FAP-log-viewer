import pandas as pd
from json import dumps


class DrivingParameters:
    def __init__(self, file_path):
        self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
        self._process_data()
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

    def _process_data(self):
        """Convert necessary columns."""

        # Convert relevant columns to numeric
        self.csv["Revs"] = pd.to_numeric(self.csv["Revs"], errors="coerce")
        self.csv["Speed"] = pd.to_numeric(self.csv["Speed"], errors="coerce")
        self.csv["InjFlow"] = pd.to_numeric(self.csv["InjFlow"], errors="coerce")

    def _calculate_acceleration(self):
        """Calculate acceleration pedal position statistics."""
        # Get non-zero values for average calculation
        non_zero_accel = self.csv["AccelPedalPos"][self.csv["AccelPedalPos"] > 0]

        max_accel = self.csv["AccelPedalPos"].max()
        avg_accel = non_zero_accel.mean()

        return {"max": float(round(max_accel, 2)), "avg": float(round(avg_accel, 2))}

    def _calculate_fuel(self):
        # Constants
        diesel_density = 0.835  # kg/L for diesel fuel
        cylinders = 4  # BlueHDi 2.0 engine

        # Calculate fuel flow rate in mg/min
        self.csv["FuelFlow_mg_per_min"] = (
            self.csv["InjFlow"] * self.csv["Revs"] * (cylinders / 2)
        )

        # Convert mg/min to L/min
        self.csv["FuelFlow_L_per_min"] = (
            self.csv["FuelFlow_mg_per_min"] / 1e6
        ) / diesel_density

        # Calculate fuel consumption in L/100 km (avoid division by zero)
        self.csv["FuelConsumption_L_per_100km"] = (
            (self.csv["FuelFlow_L_per_min"] * 60) / self.csv["Speed"] * 100
        )
        self.csv["FuelConsumption_L_per_100km"] = self.csv[
            "FuelConsumption_L_per_100km"
        ].replace(
            [float("inf"), -float("inf")], None
        )  # Handle infinities

        # Compute average fuel consumption for REGEN = 0 and REGEN = 1
        avg_fuel = self.csv["FuelConsumption_L_per_100km"].mean(skipna=True)
        avg_fuel_float = float(round(avg_fuel, 2))

        # print(f"Average Fuel Consumption: {avg_fuel_float} L/100 km")
        return avg_fuel_float

    def _calculate_revs(self):
        """Calculate engine revolution statistics."""
        # Get values while driving (Speed > 0)
        driving_revs = self.csv["Revs"][self.csv["Speed"] > 0]

        min_revs = self.csv["Revs"].min()
        max_revs = self.csv["Revs"].max()
        avg_revs = self.csv["Revs"].mean()
        avg_driving_revs = driving_revs.mean()

        return {
            "min": int(round(min_revs)),
            "max": int(round(max_revs)),
            "avg": int(round(avg_revs)),
            "avgDriving": int(round(avg_driving_revs)),
        }

    def _calculate_speed(self):
        """Calculate average, max and min speed."""
        avg_speed = self.csv["Speed"].mean()
        max_speed = self.csv["Speed"].max()
        min_speed = self.csv["Speed"].min()
        return {
            "avg": float(round(avg_speed, 1)),
            "max": float(round(max_speed, 1)),
            "min": float(round(min_speed, 1)),
        }


if __name__ == "__main__":
    driving = DrivingParameters("backend/analyser/data/DCM62v2_20250328.csv")
    print(driving)
