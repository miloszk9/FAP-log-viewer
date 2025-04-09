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
        vol = None
        remain = None
        if (
            "FAPAdditiveVol" in self.csv.columns
            and not self.csv["FAPAdditiveVol"].dropna().empty
        ):
            vol = float(round(self.csv["FAPAdditiveVol"].max(), 2))
        if (
            "FAPAdditiveRemain" in self.csv.columns
            and not self.csv["FAPAdditiveRemain"].dropna().empty
        ):
            remain = float(round(self.csv["FAPAdditiveRemain"].mean(), 2))

        return {
            "vol": vol,
            "remain": remain,
        }

    def _calculate_deposits(self):
        percentage = None
        weight_gram = None
        if (
            "FAPdeposits" in self.csv.columns
            and not self.csv["FAPdeposits"].dropna().empty
        ):
            percentage = float(round(self.csv["FAPdeposits"].mean(), 2))
        if "FAPcinder" in self.csv.columns and not self.csv["FAPcinder"].dropna().empty:
            weight_gram = float(round(self.csv["FAPcinder"].mean(), 2))

        return {
            "percentage": percentage,
            "weight_gram": weight_gram,
        }

    def _calculate_last_regen(self):
        if "LastRegen" not in self.csv.columns:
            return None

        last_regen_values = self.csv["LastRegen"].dropna()
        if last_regen_values.empty:
            return None

        last_regen = last_regen_values.iloc[-1]
        return int(last_regen)

    def _calculate_last_regen_10(self):
        if "Avg10regen" not in self.csv.columns:
            return None

        last_10_regen_values = self.csv["Avg10regen"].dropna()
        if last_10_regen_values.empty:
            return None

        last_10_regen = last_10_regen_values.iloc[-1]
        return int(last_10_regen)

    def _calculate_life(self):
        life_avg = None
        left_avg = None
        if "FAP life" in self.csv.columns and not self.csv["FAP life"].dropna().empty:
            life_avg = self.csv["FAP life"].mean()
            life_avg = int(round(life_avg))
        if "FAPlifeLeft" in self.csv.columns:
            left_avg = self.csv["FAPlifeLeft"].mean()
            left_avg = int(round(left_avg))

        return {
            "life_avg": life_avg,
            "left_avg": left_avg,
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
        if "FAPsoot" not in self.csv.columns:
            return {"start": None, "end": None, "diff": None}

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
        if "FAPtemp" not in self.csv.columns or self.csv["FAPtemp"].dropna().empty:
            return {
                "min": None,
                "max": None,
                "avg": None,
            }

        temp_series = self.csv["FAPtemp"].dropna()
        return {
            "min": int(round(temp_series.min())),
            "max": int(round(temp_series.max())),
            "avg": int(round(temp_series.mean())),
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
