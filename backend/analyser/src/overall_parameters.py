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
            "distance": self.calculate_distance(),
            "duration": {
                "overall": overall_duration_str,
                "idle": idle_time_str,
                "driving": driving_time_str,
            },
            "externalTemp": self.calculate_temp(),
            "speed": self.calculate_speed(),
        }
        print(self.result)  # Optional: view result
        # return self.result  # No need to return from __init__

    def process_data(self):
        """Convert necessary columns and compute time differences."""
        self.csv["Datetime"] = pd.to_datetime(
            self.csv["Date"] + " " + self.csv["Time"], errors="coerce"
        )
        self.csv = self.csv.sort_values("Datetime")
        self.csv["Time_Diff"] = self.csv["Datetime"].diff().dt.total_seconds().fillna(0)

        # Convert relevant columns to numeric
        self.csv["Revs"] = pd.to_numeric(self.csv["Revs"], errors="coerce")
        self.csv["Speed"] = pd.to_numeric(self.csv["Speed"], errors="coerce")
        self.csv["External Temp"] = pd.to_numeric(
            self.csv["ExternalTemp"], errors="coerce"
        )

    def calculate_date(self):
        """Return the earliest date from the dataset."""
        return self.csv["Datetime"].min().strftime("%Y-%m-%d")

    def calculate_speed(self):
        """Calculate average and max speed."""
        avg_speed = self.csv["Speed"].mean()
        max_speed = self.csv["Speed"].max()
        return {"avg": float(round(avg_speed, 2)), "max": float(round(max_speed, 2))}

    def calculate_distance(self):
        """
        Approximate distance by summing Speed * Time_Diff.
        Speed is in km/h, Time_Diff is in seconds -> convert to hours.
        """
        self.csv["Distance"] = (self.csv["Speed"] * self.csv["Time_Diff"]) / 3600.0
        total_distance = self.csv["Distance"].sum()
        return float(round(total_distance, 2))

    def calculate_temp(self):
        """Return min, max, and average of External Temp column."""
        min_temp = self.csv["External Temp"].min()
        max_temp = self.csv["External Temp"].max()
        avg_temp = self.csv["External Temp"].mean()
        return {
            "avg": float(round(avg_temp, 1)),
            "max": float(round(max_temp, 1)),
            "min": float(round(min_temp, 1)),
        }

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

        overall_duration_sec = (
            self.csv["Datetime"].max() - self.csv["Datetime"].min()
        ).total_seconds()
        overall_duration_str = str(timedelta(seconds=int(overall_duration_sec)))

        # print(f"Total Idle Time: {idle_time_str} (hh:mm:ss)")
        # print(f"Total Driving Time: {driving_time_str} (hh:mm:ss)")
        # print(f"Overall Log Duration: {overall_duration_str} (hh:mm:ss)")

        return idle_time_str, driving_time_str, overall_duration_str


if __name__ == "__main__":
    analyser = OverallParameters("backend/analyser/data/DCM62v2_20250328.csv")
