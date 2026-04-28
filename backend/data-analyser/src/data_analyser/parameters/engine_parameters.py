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
            "injector": self._calculate_injector(),
            "fuelPressure": self._calculate_fuel_pressure(),
            "boost": self._calculate_boost(),
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
        oil_warm_time = after_start[after_start["OilTemp"] >= 80]["Datetime"].min()

        if pd.notna(coolant_warm_time):
            coolant_sec = (coolant_warm_time - start_time).total_seconds()
            if coolant_sec < 3600:
                result["coolant_sec"] = coolant_sec

        if pd.notna(oil_warm_time):
            oil_sec = (oil_warm_time - start_time).total_seconds()
            if oil_sec < 3600:
                result["oil_sec"] = oil_sec

        return result

    def _calculate_errors(self):
        if "Errors" not in self.csv.columns or self.csv["Errors"].dropna().empty:
            return None
        return int(self.csv["Errors"].median())

    def _calculate_injector(self):
        result = {
            "injector1": None,
            "injector2": None,
            "injector3": None,
            "injector4": None,
            "average": None,
        }

        required_cols = {
            "Revs",
            "Speed",
            "Inj.1FlowCorr",
            "Inj.2FlowCorr",
            "Inj.3FlowCorr",
            "Inj.4FlowCorr",
        }
        if not required_cols.issubset(self.csv.columns):
            return result

        idle_csv = self.csv[(self.csv["Revs"] < 1000) & (self.csv["Speed"] == 0)]
        if idle_csv.empty:
            return result

        inj1 = idle_csv["Inj.1FlowCorr"].dropna()
        inj2 = idle_csv["Inj.2FlowCorr"].dropna()
        inj3 = idle_csv["Inj.3FlowCorr"].dropna()
        inj4 = idle_csv["Inj.4FlowCorr"].dropna()

        if inj1.empty or inj2.empty or inj3.empty or inj4.empty:
            return result

        val1 = float(round(inj1.mean(), 2))
        val2 = float(round(inj2.mean(), 2))
        val3 = float(round(inj3.mean(), 2))
        val4 = float(round(inj4.mean(), 2))
        avg = float(round((val1 + val2 + val3 + val4) / 4, 2))

        result["injector1"] = val1
        result["injector2"] = val2
        result["injector3"] = val3
        result["injector4"] = val4
        result["average"] = avg

        return result

    def _calculate_fuel_pressure(self):
        result = {"avg_diff_idle_mbar": None}

        required_cols = {"Revs", "Speed", "FuelPressInstr", "FuelPress"}
        if not required_cols.issubset(self.csv.columns):
            return result

        idle_csv = self.csv[(self.csv["Revs"] < 1000) & (self.csv["Speed"] == 0)].copy()
        if idle_csv.empty:
            return result

        idle_csv["diff"] = idle_csv["FuelPress"] - idle_csv["FuelPressInstr"]
        diffs = idle_csv["diff"].dropna()
        if not diffs.empty:
            result["avg_diff_idle_mbar"] = float(round(diffs.mean(), 2))

        return result

    def _calculate_boost(self):
        result = {"avg_diff_mbar": None}

        required_cols = {"TurboInstr", "Turbopress", "REGEN"}
        if not required_cols.issubset(self.csv.columns):
            return result

        boost_csv = self.csv[
            (self.csv["TurboInstr"] > 1200)
            | (self.csv["Turbopress"] > 1200)
            | (self.csv["REGEN"] != 1)
        ].copy()
        if boost_csv.empty:
            return result

        boost_csv["diff"] = boost_csv["Turbopress"] - boost_csv["TurboInstr"]
        diffs = boost_csv["diff"].dropna()
        if not diffs.empty:
            result["avg_diff_mbar"] = float(round(diffs.mean(), 2))

        return result


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Source venv first:
    # source ~/venv/fap/bin/activate
    # Usage: python -m data_analyser.parameters.engine_parameters
    file_path = "../data/ds4/DCM62v2_20250326.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    numeric_columns = [
        "Battery",
        "Coolant",
        "Errors",
        "FuelPress",
        "FuelPressInstr",
        "Inj.1FlowCorr",
        "Inj.2FlowCorr",
        "Inj.3FlowCorr",
        "Inj.4FlowCorr",
        "OilCarbon",
        "OilDilution",
        "OilTemp",
        "REGEN",
        "Revs",
        "Speed",
        "TurboInstr",
        "Turbopress",
    ]
    for col in numeric_columns:
        if col in csv.columns:
            csv[col] = pd.to_numeric(csv[col], errors="coerce")

    csv["Datetime"] = pd.to_datetime(csv["Date"] + " " + csv["Time"], errors="coerce")
    csv = csv.sort_values("Datetime")

    engine_parameters = [col for col in numeric_columns if col in csv.columns] + [
        "Datetime"
    ]
    filtered_csv = csv[engine_parameters].copy()

    engineParameters = EngineParameters(filtered_csv)
    print(engineParameters)
