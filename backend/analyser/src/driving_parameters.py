import pandas as pd
from datetime import timedelta


class DrivingParameters:
    def __init__(self, file_path):
        self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
        self.process_data()
        self.result = {
            "acceleration": self.calculate_acceleration(),
            "fuelConsumption": self.calculate_fuel(),
            "revs": self.calculate_revs(),
            "speed": self.calculate_speed(),
        }
        print(self.result)  # Optional: view result
        # return self.result  # No need to return from __init__

    def process_data(self):
        """Convert necessary columns."""

        # Convert relevant columns to numeric
        self.csv["Revs"] = pd.to_numeric(self.csv["Revs"], errors="coerce")
        self.csv["Speed"] = pd.to_numeric(self.csv["Speed"], errors="coerce")
        self.csv["InjFlow"] = pd.to_numeric(self.csv["InjFlow"], errors="coerce")

    def calculate_acceleration(self):
        return ""

    def calculate_fuel(self):
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

        print(f"Average Fuel Consumption: {avg_fuel_float} L/100 km")
        return avg_fuel_float

    def calculate_revs(self):
        return ""

    def calculate_speed(self):
        """Calculate average, max and min speed."""
        avg_speed = self.csv["Speed"].mean()
        max_speed = self.csv["Speed"].max()
        min_speed = self.csv["Speed"].min()
        return {
            "avg": float(round(avg_speed, 2)),
            "max": float(round(max_speed, 2)),
            "min": float(round(min_speed, 2)),
        }


if __name__ == "__main__":
    analyser = DrivingParameters("backend/analyser/data/DCM62v2_20250328.csv")
