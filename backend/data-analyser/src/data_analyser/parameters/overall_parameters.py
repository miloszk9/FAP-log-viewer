from json import dumps

import pandas as pd

from .utils import calculate_total_distance


class OverallParameters:
    def __init__(self, csv):
        self.csv = csv
        self.result = {
            "distance_km": self._calculate_distance(),
            "duration": self._calculate_duration(),
            "externalTemp": self._calculate_temp(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_distance(self):
        """Calculate total distance in km."""
        total_distance = calculate_total_distance(self.csv)
        return float(round(total_distance, 2))

    def _calculate_temp(self):
        """Return min, max, and average of ExternalTemp column."""
        if (
            "ExternalTemp" not in self.csv.columns
            or self.csv["ExternalTemp"].dropna().empty
        ):
            return {"avg_c": None, "max_c": None, "min_c": None}

        temp = self.csv["ExternalTemp"].dropna()
        return {
            "avg_c": float(round(temp.mean(), 1)),
            "max_c": float(round(temp.max(), 1)),
            "min_c": float(round(temp.min(), 1)),
        }

    def _calculate_duration(self):
        """Calculate overall, engine off, engine on, idle, and driving time."""
        required_cols = {"Speed", "Revs", "Time_Diff", "Datetime"}
        if (
            not required_cols.issubset(self.csv.columns)
            or self.csv[list(required_cols)].dropna().empty
        ):
            return {
                "overall_sec": None,
                "engineOff_sec": None,
                "engineOn_sec": None,
                "idle_sec": None,
                "driving_sec": None,
            }

        self.csv["EngineOff_Time"] = (self.csv["Revs"] == 0) * self.csv["Time_Diff"]
        self.csv["EngineOn_Time"] = (self.csv["Revs"] > 0) * self.csv["Time_Diff"]
        self.csv["Idle_Time"] = (
            (self.csv["Speed"] == 0) & (self.csv["Revs"] > 0)
        ) * self.csv["Time_Diff"]
        self.csv["Driving_Time"] = (self.csv["Speed"] > 0) * self.csv["Time_Diff"]

        engine_off_sec = self.csv["EngineOff_Time"].sum(skipna=True)
        engine_on_sec = self.csv["EngineOn_Time"].sum(skipna=True)
        idle_time_sec = self.csv["Idle_Time"].sum(skipna=True)
        driving_time_sec = self.csv["Driving_Time"].sum(skipna=True)
        overall_duration_sec = self.csv["Time_Diff"].sum(skipna=True)

        return {
            "overall_sec": int(overall_duration_sec),
            "engineOff_sec": int(engine_off_sec),
            "engineOn_sec": int(engine_on_sec),
            "idle_sec": int(idle_time_sec),
            "driving_sec": int(driving_time_sec),
        }


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Usage: python -m data_analyser.parameters.overall_parameters
    file_path = "../data/ds4/DCM62v2_20250222.csv"
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
