from json import dumps

import pandas as pd


class EngineParameters:
    def __init__(self, csv):
        self.csv = csv
        self.result = {
            "battery": self._calculate_battery(),
            "coolantTemp": self._calculate_coolant_temp(),
            "engineWarmup": self._calculate_warmup_time(),
            "errors": self._calculate_errors(),
            "oilCarbonate_perc": self._calculate_oil_carbonate(),
            "oilDilution_perc": self._calculate_oil_dilution(),
            "oilTemp": self._calculate_oil_temp(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_coolant_temp(self):
        if "Coolant" not in self.csv.columns or self.csv["Coolant"].dropna().empty:
            return {"min_c": None, "max_c": None, "avg_c": None}

        values = self.csv["Coolant"].dropna()
        return {
            "min_c": round(values.min()),
            "max_c": round(values.max()),
            "avg_c": round(values.mean()),
        }

    def _calculate_oil_temp(self):
        if "OilTemp" not in self.csv.columns or self.csv["OilTemp"].dropna().empty:
            return {"min_c": None, "max_c": None, "avg_c": None}

        values = self.csv["OilTemp"].dropna()
        return {
            "min_c": round(values.min()),
            "max_c": round(values.max()),
            "avg_c": round(values.mean()),
        }

    def _calculate_oil_dilution(self):
        if (
            "OilDilution" not in self.csv.columns
            or self.csv["OilDilution"].dropna().empty
        ):
            return None
        return round(self.csv["OilDilution"].median())

    def _calculate_oil_carbonate(self):
        if "OilCarbon" not in self.csv.columns or self.csv["OilCarbon"].dropna().empty:
            return None
        return round(self.csv["OilCarbon"].median())

    def _calculate_battery(self):
        result = {
            "beforeDrive_v": None,
            "engineRunning_v": None,
        }

        if "Revs" not in self.csv.columns or "Battery" not in self.csv.columns:
            return result

        revs = self.csv["Revs"]
        battery = self.csv["Battery"]

        if revs.dropna().empty or battery.dropna().empty:
            return result

        first_start_index = revs[revs > 0].first_valid_index()

        if first_start_index is None:
            # Engine never started, all data is before drive
            before_drive = battery[revs == 0].dropna()
            result["beforeDrive_v"] = (
                float(round(before_drive.mean(), 2)) if not before_drive.empty else None
            )
            return result

        if first_start_index != 0:
            # Battery readings before first engine start
            before_drive = self.csv.loc[: first_start_index - 1]
            before_drive = before_drive[before_drive["Revs"] == 0]["Battery"].dropna()
        else:
            before_drive = pd.Series(dtype="float64")

        engine_running = self.csv[self.csv["Revs"] > 0]["Battery"].dropna()

        result["beforeDrive_v"] = (
            float(round(before_drive.mean(), 2)) if not before_drive.empty else None
        )

        result["engineRunning_v"] = (
            float(round(engine_running.mean(), 2)) if not engine_running.empty else None
        )

        return result

    def _calculate_warmup_time(self):
        result = {
            "coolant_sec": None,
            "oil_sec": None,
        }

        required_cols = {"Datetime", "Coolant", "OilTemp"}
        if not required_cols.issubset(self.csv.columns):
            return result

        csv_valid = self.csv.dropna(subset=list(required_cols))
        if csv_valid.empty:
            return result

        initial_state = (
            csv_valid[(csv_valid["Coolant"] < 40) | (csv_valid["OilTemp"] < 40)]
            .sort_values("Datetime")
            .head(1)
        )

        if initial_state.empty:
            return result

        start_time = initial_state["Datetime"].iloc[0]
        after_start = csv_valid[csv_valid["Datetime"] >= start_time]

        coolant_warm_time = after_start[after_start["Coolant"] >= 80]["Datetime"].min()
        oil_warm_time = after_start[after_start["OilTemp"] >= 90]["Datetime"].min()

        result["coolant_sec"] = (
            (coolant_warm_time - start_time).total_seconds()
            if pd.notna(coolant_warm_time)
            else None
        )
        result["oil_sec"] = (
            (oil_warm_time - start_time).total_seconds()
            if pd.notna(oil_warm_time)
            else None
        )

        return result

    def _calculate_errors(self):
        if "Errors" not in self.csv.columns or self.csv["Errors"].dropna().empty:
            return None
        return int(self.csv["Errors"].median())


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Usage: python -m data_analyser.parameters.engine_parameters
    file_path = "../data/ds4/DCM62v2_20250205.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    numeric_columns = [
        "Battery",
        "Coolant",
        "Errors",
        "OilCarbon",
        "OilDilution",
        "OilTemp",
        "Revs",
    ]
    for col in numeric_columns:
        if col in csv.columns:
            csv[col] = pd.to_numeric(csv[col], errors="coerce")

    csv["Datetime"] = pd.to_datetime(csv["Date"] + " " + csv["Time"], errors="coerce")
    csv = csv.sort_values("Datetime")

    engine_parameters = numeric_columns + ["Datetime"]
    filtered_csv = csv[engine_parameters].copy()

    engineParameters = EngineParameters(filtered_csv)
    print(engineParameters)
