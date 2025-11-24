from json import dumps

import pandas as pd

from .utils import calculate_fuel_consumption, calculate_total_distance


class FapRegenParameters:
    def __init__(self, csv):
        self.csv = csv
        if "REGEN" not in self.csv.columns or self.csv[self.csv["REGEN"] == 1].empty:
            self.result = None
            return

        self.csv_regen = self.csv[self.csv["REGEN"] == 1]
        self.result = {
            "previousRegen_km": self._calculate_previous_regen(),
            "duration_sec": self._calculate_duration_sec(),
            "distance_km": self._calculate_distance(),
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
        # Get the last row where REGEN == 1 and return the 'LastRegen' value from that row
        if (
            "REGEN" not in self.csv.columns
            or self.csv["REGEN"].dropna().empty
            or "LastRegen" not in self.csv.columns
            or self.csv["LastRegen"].dropna().empty
        ):
            return None

        regen_rows = self.csv[self.csv["REGEN"] == 1]
        if regen_rows.empty:
            return None

        last_regen_row = regen_rows.iloc[-1]
        value = last_regen_row["LastRegen"]
        if pd.notna(value):
            return int(value)
        return None

    def _calculate_duration_sec(self):
        if (
            self.csv is None
            or "REGEN" not in self.csv.columns
            or "Datetime" not in self.csv.columns
        ):
            return None

        # Create a mask for REGEN==1
        regen_mask = self.csv["REGEN"] == 1
        # Block id increases when REGEN changes (from 0 to 1 or 1 to 0)
        block_ids = (regen_mask != regen_mask.shift()).cumsum()
        self.csv["_regen_block"] = block_ids

        # Filter only REGEN==1 blocks
        regen_blocks = self.csv[regen_mask].groupby("_regen_block")

        total_duration = 0
        for _, group in regen_blocks:
            datetimes = group["Datetime"].dropna()
            if not datetimes.empty:
                duration = (datetimes.iloc[-1] - datetimes.iloc[0]).total_seconds()
                total_duration += duration

        self.csv.drop(columns=["_regen_block"], inplace=True)
        return int(total_duration) if total_duration > 0 else None

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
            "min_kmh": int(round(speed.min())),
            "max_kmh": int(round(speed.max())),
            "avg_kmh": int(round(speed.mean())),
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
            "min_c": int(round(temp.min())),
            "max_c": int(round(temp.max())),
            "avg_c": int(round(temp.mean())),
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
            "min_mbar": int(round(pressure.min())),
            "max_mbar": int(round(pressure.max())),
            "avg_mbar": int(round(pressure.mean())),
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
            "min": int(round(revs.min())),
            "max": int(round(revs.max())),
            "avg": int(round(revs.mean())),
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
            "start_gl": float(round(start, 2)),
            "end_gl": float(round(end, 2)),
            "diff_gl": float(round(end - start, 2)),
        }

    def _calculate_fuel(self):
        regen_on_df = self.csv[self.csv["REGEN"] == 1]
        regen_off_df = self.csv[self.csv["REGEN"] == 0]

        regen_on_fuel = calculate_fuel_consumption(regen_on_df)
        regen_on_distance = calculate_total_distance(regen_on_df)

        regen_l100km = None
        if regen_on_distance > 0:
            regen_l100km = (regen_on_fuel / regen_on_distance) * 100

        regen_off_fuel = calculate_fuel_consumption(regen_off_df)
        regen_off_distance = calculate_total_distance(regen_off_df)

        non_regen_l100km = None
        if regen_on_distance > 0:
            non_regen_l100km = (regen_off_fuel / regen_off_distance) * 100

        return {
            "regen_l100km": float(round(regen_l100km, 2)) if regen_l100km else None,
            "nonRegen_l100km": float(round(non_regen_l100km, 2))
            if non_regen_l100km
            else None,
        }


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Usage: python -m data_analyser.parameters.fap_regen_parameters
    file_path = "../data/ds4/DCM62v2_20250328.csv"
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
