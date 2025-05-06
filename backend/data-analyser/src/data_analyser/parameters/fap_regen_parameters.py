from json import dumps

import pandas as pd


class FapRegenParameters:
    def __init__(self, csv):
        self.csv = csv
        if "REGEN" not in self.csv.columns or self.csv[self.csv["REGEN"] == 1].empty:
            self.result = None
            return

        self.csv_regen = self.csv[self.csv["REGEN"] == 1]
        self.result = {
            "previousRegen": self._calculate_previous_regen(),
            "duration": self._calculate_duration_sec(),
            "distance": self._calculate_distance(),
            "speed": self._calculate_speed(),
            "fapTemp": self._calculate_fap_temp(),
            "fapPressure": self._calculate_fap_pressure(),
            "revs": self._calculate_revs(),
            "fapSoot": self._calculate_fap_soot(),
            "fuelConsumption": self._calculate_fuel(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_previous_regen(self):
        # Find index where REGEN changes from 0 → 1
        if (
            "REGEN" not in self.csv.columns
            or self.csv["REGEN"].dropna().empty
            or "LastRegen" not in self.csv.columns
            or self.csv["LastRegen"].dropna().empty
        ):
            return None

        csv_regen_change = self.csv["REGEN"].diff().fillna(0)
        regen_start_idx = self.csv.index[csv_regen_change == 1]

        if regen_start_idx.empty:
            return None

        first_regen_idx = regen_start_idx[0]
        prev_idx = first_regen_idx - 1

        if prev_idx in self.csv.index:
            value = self.csv.at[prev_idx, "LastRegen"]
            if pd.notna(value):
                return int(value)
        return None

    def _calculate_duration_sec(self):
        # TODO: Address multiple FAP regens scenario - will produce wrong duration time
        if self.csv_regen is None or "Datetime" not in self.csv_regen.columns:
            return None

        datetimes = self.csv_regen["Datetime"].dropna()
        if datetimes.empty:
            return None

        start_time = datetimes.iloc[0]
        end_time = datetimes.iloc[-1]

        if pd.isna(start_time) or pd.isna(end_time):
            return None

        duration = (end_time - start_time).total_seconds()
        return int(duration)

    def _calculate_distance(self):
        if (
            self.csv_regen is None
            or "Speed" not in self.csv_regen.columns
            or "Time_Diff" not in self.csv_regen.columns
            or self.csv["Speed"].dropna().empty
            or self.csv["Time_Diff"].dropna().empty
        ):
            return None

        speed = self.csv_regen["Speed"].dropna()
        time_diff = self.csv_regen["Time_Diff"].dropna()
        regen_distance = (speed * time_diff) / 3600.0
        return float(round(regen_distance.sum(), 1))

    def _calculate_speed(self):
        if (
            self.csv_regen is None
            or "Speed" not in self.csv_regen.columns
            or self.csv_regen["Speed"].dropna().empty
        ):
            return None

        speed = self.csv_regen["Speed"].dropna()
        return {
            "min": float(round(speed.min(), 2)),
            "max": float(round(speed.max(), 2)),
            "avg": float(round(speed.mean(), 2)),
        }

    def _calculate_fap_temp(self):
        if (
            self.csv_regen is None
            or "FAPtemp" not in self.csv_regen.columns
            or self.csv_regen["FAPtemp"].dropna().empty
        ):
            return None

        temp = self.csv_regen["FAPtemp"].dropna()
        return {
            "min": float(round(temp.min(), 2)),
            "max": float(round(temp.max(), 2)),
            "avg": float(round(temp.mean(), 2)),
        }

    def _calculate_fap_pressure(self):
        if (
            self.csv_regen is None
            or "FAPpressure" not in self.csv_regen.columns
            or self.csv_regen["FAPpressure"].dropna().empty
        ):
            return None

        pressure = self.csv_regen["FAPpressure"].dropna()

        pressure = pressure[pressure != 65280.0]

        if pressure.empty:
            return None
        return {
            "min": float(round(pressure.min(), 2)),
            "max": float(round(pressure.max(), 2)),
            "avg": float(round(pressure.mean(), 2)),
        }

    def _calculate_revs(self):
        if (
            self.csv_regen is None
            or "Revs" not in self.csv_regen.columns
            or self.csv_regen["Revs"].dropna().empty
        ):
            return None

        revs = self.csv_regen["Revs"].dropna()
        return {
            "min": float(round(revs.min(), 2)),
            "max": float(round(revs.max(), 2)),
            "avg": float(round(revs.mean(), 2)),
        }

    def _calculate_fap_soot(self):
        if self.csv_regen is None or "FAPsoot" not in self.csv_regen.columns:
            return None

        soot_series = self.csv_regen["FAPsoot"].dropna()
        if soot_series.empty:
            return None

        start = soot_series.iloc[0]
        end = soot_series.iloc[-1]
        return {
            "start": float(round(start, 2)),
            "end": float(round(end, 2)),
            "diff": float(round(end - start, 2)),
        }

    def _calculate_fuel(self):
        required_cols = {"InjFlow", "Revs", "Speed", "REGEN"}
        if not required_cols.issubset(self.csv.columns):
            return {"regen": None, "non-regen": None}

        diesel_density = 0.8375
        cylinders = 4

        try:
            self.csv["FuelFlow_mg_per_min"] = (
                self.csv["InjFlow"] * self.csv["Revs"] * (cylinders / 2)
            )
            self.csv["FuelFlow_L_per_min"] = (
                self.csv["FuelFlow_mg_per_min"] / 1e6 / diesel_density
            )

            self.csv["FuelConsumption_L_per_100km"] = (
                (self.csv["FuelFlow_L_per_min"] * 60) / self.csv["Speed"]
            ) * 100

            self.csv["FuelConsumption_L_per_100km"] = self.csv[
                "FuelConsumption_L_per_100km"
            ].replace([float("inf"), -float("inf")], pd.NA)

            regen_on = self.csv[self.csv["REGEN"] == 1][
                "FuelConsumption_L_per_100km"
            ].dropna()
            regen_off = self.csv[self.csv["REGEN"] == 0][
                "FuelConsumption_L_per_100km"
            ].dropna()

            return {
                "regen": float(round(regen_on.mean(), 2))
                if not regen_on.empty
                else None,
                "non-regen": float(round(regen_off.mean(), 2))
                if not regen_off.empty
                else None,
            }

        except Exception:
            return {"regen": None, "non-regen": None}


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Usage: python -m data_analyser.parameters.fap_regen_parameters
    file_path = "../data/ds4/DCM62v2_20250205.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    numeric_columns = [
        "FAPpressure",
        "FAPtemp",
        "FAPsoot",
        "Revs",
        "Speed",
        "InjFlow",
        "REGEN",
        "LastRegen",
    ]
    for col in numeric_columns:
        if col in csv.columns:
            csv[col] = pd.to_numeric(csv[col], errors="coerce")

    csv["Datetime"] = pd.to_datetime(csv["Date"] + " " + csv["Time"], errors="coerce")
    csv = csv.sort_values("Datetime")
    csv["Time_Diff"] = csv["Datetime"].diff().dt.total_seconds().fillna(0)

    fap_regen_parameters = numeric_columns + ["Datetime", "Time_Diff"]
    filtered_csv = csv[fap_regen_parameters].copy()

    fapRegenParameters = FapRegenParameters(filtered_csv)
    print(fapRegenParameters)
