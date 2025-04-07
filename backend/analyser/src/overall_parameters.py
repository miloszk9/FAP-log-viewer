from datetime import timedelta
from json import dumps

import pandas as pd


class OverallParameters:
    def __init__(self, csv):
        self.csv = csv
        idle_time_str, driving_time_str, overall_duration_str = (
            self._calculate_idle_driving_duration()
        )
        self.result = {
            "date": self._calculate_date(),
            "distance": self._calculate_distance(),
            "duration": {
                "overall": overall_duration_str,
                "idle": idle_time_str,
                "driving": driving_time_str,
            },
            "externalTemp": self._calculate_temp(),
            "speed": self._calculate_speed(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_date(self):
        """Return the earliest date from the dataset."""
        return self.csv["Datetime"].min().strftime("%Y-%m-%d")

    def _calculate_speed(self):
        """Calculate average and max speed."""
        avg_speed = self.csv["Speed"].mean()
        max_speed = self.csv["Speed"].max()
        return {"avg": float(round(avg_speed, 2)), "max": float(round(max_speed, 2))}

    def _calculate_distance(self):
        """
        Approximate distance by summing Speed * Time_Diff.
        Speed is in km/h, Time_Diff is in seconds -> convert to hours.
        """
        self.csv["Distance"] = (self.csv["Speed"] * self.csv["Time_Diff"]) / 3600.0
        total_distance = self.csv["Distance"].sum()
        return float(round(total_distance, 2))

    def _calculate_temp(self):
        """Return min, max, and average of ExternalTemp column."""
        min_temp = self.csv["ExternalTemp"].min()
        max_temp = self.csv["ExternalTemp"].max()
        avg_temp = self.csv["ExternalTemp"].mean()
        return {
            "avg": float(round(avg_temp, 1)),
            "max": float(round(max_temp, 1)),
            "min": float(round(min_temp, 1)),
        }

    def _calculate_idle_driving_duration(self):
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

        return idle_time_str, driving_time_str, overall_duration_str


if __name__ == "__main__":
    file_path = "backend/analyser/data/DCM62v2_20250328.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    numeric_columns = ["Revs", "Speed", "ExternalTemp"]
    for col in numeric_columns:
        if col in csv.columns:
            csv[col] = pd.to_numeric(csv[col], errors="coerce")

    csv["Datetime"] = pd.to_datetime(csv["Date"] + " " + csv["Time"], errors="coerce")
    csv = csv.sort_values("Datetime")
    csv["Time_Diff"] = csv["Datetime"].diff().dt.total_seconds().fillna(0)

    overall_parameters = ["Revs", "Speed", "ExternalTemp", "Datetime", "Time_Diff"]
    filtered_csv = csv[overall_parameters].copy()

    overallParameters = OverallParameters(filtered_csv)
    print(overallParameters)
