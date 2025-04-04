import pandas as pd
from datetime import timedelta


class OverallParameters:
    def __init__(self, file_path):
        self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
        self.process_data()
        idle_time_str, driving_time_str, overall_duration_str = (
            self.calculate_idle_driving_duration()
        )
        self.result = {
            "date": self.calculate_date(),
            "speed": self.calculate_speed(),
            "distance": self.calculate_distance(),
            "temp": self.calculate_temp(),
            "duration": overall_duration_str,
            "idle_time": idle_time_str,
            "driving_time": driving_time_str,
        }
        return self.result

    def process_data(self):
        """Convert necessary columns and compute time differences."""
        self.csv["Datetime"] = pd.to_datetime(
            self.csv["Date"] + " " + self.csv["Time"], errors="coerce"
        )
        self.csv = self.csv.sort_values("Datetime")  # Ensure correct order
        self.csv["Time_Diff"] = self.csv["Datetime"].diff().dt.total_seconds().fillna(0)

        # Convert relevant columns to numeric
        self.csv["Revs"] = pd.to_numeric(self.csv["Revs"], errors="coerce")
        self.csv["Speed"] = pd.to_numeric(self.csv["Speed"], errors="coerce")

    def calculate_date(self):
        pass

    def calculate_speed(self):
        pass

    def calculate_distance(self):
        pass

    def calculate_temp(self):
        pass

    def calculate_idle_driving_duration(self):
        """Calculate total idle time, driving time, and overall duration."""
        self.csv["Idle_Time"] = (
            (self.csv["Speed"] == 0) & (self.csv["Revs"] > 0)
        ) * self.csv["Time_Diff"]
        self.csv["Driving_Time"] = (self.csv["Speed"] > 0) * self.csv["Time_Diff"]

        idle_time_sec = self.csv["Idle_Time"].sum()
        driving_time_sec = self.csv["Driving_Time"].sum()

        idle_time_str = str(timedelta(seconds=int(idle_time_sec)))
        driving_time_str = str(timedelta(seconds=int(driving_time_sec)))

        # Calculate overall duration accounting for gaps
        overall_duration_sec = (
            self.csv["Datetime"].max() - self.csv["Datetime"].min()
        ).total_seconds()
        overall_duration_str = str(timedelta(seconds=int(overall_duration_sec)))

        print(f"Total Idle Time: {idle_time_str} (hh:mm:ss)")
        print(f"Total Driving Time: {driving_time_str} (hh:mm:ss)")
        print(f"Overall Log Duration: {overall_duration_str} (hh:mm:ss)")

        return idle_time_str, driving_time_str, overall_duration_str


if __name__ == "__main__":
    analyzer = OverallParameters("backend/analyzer/data/DCM62v2_20250328.csv")
