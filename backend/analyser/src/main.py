from json import dumps
from time import time

import pandas as pd
from driving_parameters import DrivingParameters
from engine_parameters import EngineParameters
from fap_parameters import FapParameters
from fap_regen_parameters import FapRegenParameters
from overall_parameters import OverallParameters


class FapLogAnalyser:
    def __init__(self, file_path):
        self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
        self._process_data()
        self.result = self._analyse_parameters()

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _process_data(self):
        """Preprocess the data."""
        numeric_columns = [
            "AccelPedalPos",
            "Avg10regen",
            "Battery",
            "Coolant",
            "Errors",
            "ExternalTemp",
            "FAP life",
            "FAPAdditiveRemain",
            "FAPAdditiveVol",
            "FAPcinder",
            "FAPdeposits",
            "FAPlifeLeft",
            "FAPpressure",
            "FAPsoot",
            "FAPtemp",
            "InjFlow",
            "LastRegen",
            "OilCarbon",
            "OilDilution",
            "OilTemp",
            "REGEN",
            "Revs",
            "Speed",
        ]
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
        overall_parameters = ["Revs", "Speed", "ExternalTemp", "Datetime", "Time_Diff"]
        driving_parameters = ["Revs", "Speed", "InjFlow", "AccelPedalPos"]
        engine_parameters = [
            "Battery",
            "Coolant",
            "Datetime",
            "Errors",
            "OilCarbon",
            "OilDilution",
            "OilTemp",
            "Revs",
        ]
        fap_parameters = [
            "Avg10regen",
            "FAP life",
            "FAPAdditiveRemain",
            "FAPAdditiveVol",
            "FAPcinder",
            "FAPdeposits",
            "FAPlifeLeft",
            "FAPpressure",
            "FAPsoot",
            "FAPtemp",
            "LastRegen",
            "Revs",
            "Speed",
        ]
        fap_regen_parameters = [
            "FAPpressure",
            "FAPtemp",
            "FAPsoot",
            "Revs",
            "Speed",
            "InjFlow",
            "REGEN",
            "LastRegen",
            "Datetime",
            "Time_Diff",
        ]
        return {
            "overall": OverallParameters(self.csv[overall_parameters].copy()).result,
            "driving": DrivingParameters(self.csv[driving_parameters].copy()).result,
            "engine": EngineParameters(self.csv[engine_parameters].copy()).result,
            "fap": FapParameters(self.csv[fap_parameters].copy()).result,
            "fapRegen": FapRegenParameters(
                self.csv[fap_regen_parameters].copy()
            ).result,
        }


if __name__ == "__main__":
    start = time()
    file_path = "backend/analyser/data/DCM62v2_20240720.csv"
    fapLogAnalyse = FapLogAnalyser(file_path)
    end = time()
    # print(end - start)
    print(fapLogAnalyse)
