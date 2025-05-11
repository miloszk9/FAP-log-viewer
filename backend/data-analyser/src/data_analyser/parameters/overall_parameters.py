from datetime import timedelta
from json import dumps

import pandas as pd


class OverallParameters:
    def __init__(self, csv):
        self.csv = csv
        self.result = {
            "distance": self._calculate_distance(),
            "duration": self._calculate_duration(),
            "externalTemp": self._calculate_temp(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_distance(self):
        """
        Approximate distance by summing Speed * Time_Diff.
        Speed is in km/h, Time_Diff is in seconds -> convert to hours.
        """
        if (
            not {"Speed", "Time_Diff"}.issubset(self.csv.columns)
            or self.csv[["Speed", "Time_Diff"]].dropna().empty
        ):
            return None

        self.csv["Distance"] = (
            self.csv["Speed"].dropna() * self.csv["Time_Diff"].dropna()
        ) / 3600.0
        total_distance = self.csv["Distance"].sum()
        return float(round(total_distance, 2))

    def _calculate_temp(self):
        """Return min, max, and average of ExternalTemp column."""
        if (
            "ExternalTemp" not in self.csv.columns
            or self.csv["ExternalTemp"].dropna().empty
        ):
            return {"avg": None, "max": None, "min": None}

        temp = self.csv["ExternalTemp"].dropna()
        return {
            "avg": float(round(temp.mean(), 1)),
            "max": float(round(temp.max(), 1)),
            "min": float(round(temp.min(), 1)),
        }

    def _calculate_duration(self):
        """ Calculate overall, engine off, engine on, idle, and driving time."""
        required_cols = {"Speed", "Revs", "Time_Diff", "Datetime"}
        if (
            not required_cols.issubset(self.csv.columns)
            or self.csv[list(required_cols)].dropna().empty
        ):
            return {
                "overall": None,
                "engineOff": None,
                "engineOn": None,
                "idle": None,
                "driving": None,
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
            "overall": int(overall_duration_sec),
            "engineOff": int(engine_off_sec),
            "engineOn": int(engine_on_sec),
            "idle": int(idle_time_sec),
            "driving": int(driving_time_sec),
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
