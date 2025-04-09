from json import dumps
from time import time

import pandas as pd
from csv_columns import (
    driving_parameters,
    engine_parameters,
    fap_parameters,
    fap_regen_parameters,
    overall_parameters,
)
from driving_parameters import DrivingParameters
from engine_parameters import EngineParameters
from fap_parameters import FapParameters
from fap_regen_parameters import FapRegenParameters
from overall_parameters import OverallParameters


class FapLogAnalyser:
    def __init__(self, file_path):
        self.all_columns = set(
            driving_parameters
            + engine_parameters
            + fap_parameters
            + fap_regen_parameters
            + overall_parameters
        )
        self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
        self._process_data()
        self.result = self._analyse_parameters()

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _process_data(self):
        """Preprocess the data."""
        numeric_columns = list(set(self.all_columns) - {"Datetime", "Time_Diff"})
        for col in numeric_columns:
            if col in self.csv.columns:
                self.csv[col] = pd.to_numeric(self.csv[col], errors="coerce")

        self.csv["Datetime"] = pd.to_datetime(
            self.csv["Date"] + " " + self.csv["Time"], errors="coerce"
        )
        self.csv = self.csv.sort_values("Datetime")
        self.csv["Time_Diff"] = self.csv["Datetime"].diff().dt.total_seconds().fillna(0)

    def _analyse_parameters(self):
        """Preprocess the data."""
        csv_columns = self.csv.columns
        overall_columns = list(set(csv_columns) & set(overall_parameters))
        driving_columns = list(set(csv_columns) & set(driving_parameters))
        engine_columns = list(set(csv_columns) & set(engine_parameters))
        fap_columns = list(set(csv_columns) & set(fap_parameters))
        fap_regen_columns = list(set(csv_columns) & set(fap_regen_parameters))
        return {
            "overall": OverallParameters(self.csv[overall_columns].copy()).result,
            "driving": DrivingParameters(self.csv[driving_columns].copy()).result,
            "engine": EngineParameters(self.csv[engine_columns].copy()).result,
            "fap": FapParameters(self.csv[fap_columns].copy()).result,
            "fapRegen": FapRegenParameters(self.csv[fap_regen_columns].copy()).result,
        }


if __name__ == "__main__":
    start = time()
    file_path = "backend/analyser/data/DCM62v2_20240720.csv"
    fapLogAnalyse = FapLogAnalyser(file_path)
    end = time()
    # print(end - start)
    print(fapLogAnalyse)
