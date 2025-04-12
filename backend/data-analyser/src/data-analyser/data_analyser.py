from json import dumps
from time import time

import pandas as pd
from constants.csv_columns import (
    driving_parameters,
    engine_parameters,
    fap_parameters,
    fap_regen_parameters,
    overall_parameters,
)
from parameters.driving_parameters import DrivingParameters
from parameters.engine_parameters import EngineParameters
from parameters.fap_parameters import FapParameters
from parameters.fap_regen_parameters import FapRegenParameters
from parameters.overall_parameters import OverallParameters


class DataAnalyser:
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

        # Drop rows with unrealistic values of FAPpressure or FAPtemp
        if "FAPpressure" in self.csv.columns:
            self.csv = self.csv[self.csv.get("FAPpressure") != 65280.0]
        if "FAPtemp" in self.csv.columns:
            self.csv = self.csv[self.csv.get("FAPtemp") != 25855.0]

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
    import os

    data_dir = "backend/data-analyser/data/peugeot/"
    csv_files = [f for f in os.listdir(data_dir) if f.endswith(".csv")]

    for file_name in csv_files:
        file_path = os.path.join(data_dir, file_name)
        print(file_path)
        # file_path = "backend/analyser/data/peugeot/HDI_SID807_BR2_20240116.csv"
        start = time()
        fapLogAnalyse = DataAnalyser(file_path)
        end = time()
        # print(end - start)
        print(fapLogAnalyse)
