from json import dumps

import pandas as pd


class FapParameters:
    def __init__(self, csv):
        self.csv = csv
        self.result = {
            "additive": self._calculate_additive(),
            "deposits": self._calculate_deposits(),
            "lastRegen": self._calculate_last_regen(),
            "lastRegen10": self._calculate_last_regen_10(),
            "life": self._calculate_life(),
            "pressure_idle": self._calculate_pressure_idle(),
            "pressure": self._calculate_pressure(),
            "soot": self._calculate_soot(),
            "temp": self._calculate_temp(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_additive(self):
        return {
            "vol": float(round(self.csv["FAPAdditiveVol"].max(), 2)),
            "remain": float(round(self.csv["FAPAdditiveRemain"].mean(), 2)),
        }

    def _calculate_deposits(self):
        return {
            "percentage": float(round(self.csv["FAPdeposits"].mean(), 2)),
            "weight_gram": float(round(self.csv["FAPcinder"].mean(), 2)),
        }

    def _calculate_last_regen(self):
        last_regen_values = self.csv["LastRegen"].dropna()

        if last_regen_values.empty:
            return None

        last_regen = last_regen_values.iloc[-1]
        return int(last_regen)

    def _calculate_last_regen_10(self):
        last_10_regen_values = self.csv["Avg10regen"].dropna()

        if last_10_regen_values.empty:
            return None

        last_10_regen = last_10_regen_values.iloc[-1]
        return int(last_10_regen)

    def _calculate_life(self):
        return {
            "life_avg": int(round(self.csv["FAP life"].mean())),
            "left_avg": int(round(self.csv["FAPlifeLeft"].mean())),
        }

    def _calculate_pressure_idle(self):
        idle_csv = self.csv[(self.csv["Revs"] < 1000) & (self.csv["Speed"] == 0)]
        min_pressure = idle_csv["FAPpressure"].min()
        max_pressure = idle_csv["FAPpressure"].max()
        avg_pressure = idle_csv["FAPpressure"].mean()

        return {
            "avg": float(round(avg_pressure, 1)),
            "max": float(round(max_pressure, 1)),
            "min": float(round(min_pressure, 1)),
        }

    def _calculate_pressure(self):
        return {
            "min": float(round(self.csv["FAPpressure"].min(), 1)),
            "max": float(round(self.csv["FAPpressure"].max(), 1)),
            "avg": float(round(self.csv["FAPpressure"].mean(), 1)),
        }

    def _calculate_soot(self):
        soot_series = self.csv["FAPsoot"].dropna()

        if soot_series.empty:
            return {"start": None, "end": None, "diff": None}

        start = soot_series.iloc[0]
        end = soot_series.iloc[-1]
        diff = float(round(end - start, 2))

        return {
            "start": float(round(start, 2)),
            "end": float(round(end, 2)),
            "diff": diff,
        }

    def _calculate_temp(self):
        return {
            "min": int(round(self.csv["FAPtemp"].min())),
            "max": int(round(self.csv["FAPtemp"].max())),
            "avg": int(round(self.csv["FAPtemp"].mean())),
        }


if __name__ == "__main__":
    file_path = "backend/analyser/data/DCM62v2_20250328.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    numeric_columns = [
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
    for col in numeric_columns:
        if col in csv.columns:
            csv[col] = pd.to_numeric(csv[col], errors="coerce")

    fap_parameters = numeric_columns
    filtered_csv = csv[fap_parameters].copy()

    fapParameters = FapParameters(filtered_csv)
    print(fapParameters)
