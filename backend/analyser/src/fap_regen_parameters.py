import pandas as pd
from json import dumps


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
        csv_regen_change = self.csv["REGEN"].diff().fillna(0)
        regen_start_idx = self.csv.index[csv_regen_change == 1]

        if regen_start_idx.empty:
            return None

        first_regen_idx = regen_start_idx[0]
        prev_idx = first_regen_idx - 1

        if prev_idx in self.csv.index and "LastRegen" in self.csv.columns:
            value = self.csv.at[prev_idx, "LastRegen"]
            if pd.notna(value):
                return int(value)

    def _calculate_duration_sec(self):
        # TODO: Address multiple FAP regens scenario - will produce wrong duration time
        if self.csv_regen is None or "Datetime" not in self.csv_regen.columns:
            return None

        start_time = self.csv_regen["Datetime"].iloc[0]
        end_time = self.csv_regen["Datetime"].iloc[-1]

        if pd.isna(start_time) or pd.isna(end_time):
            return None

        duration = (end_time - start_time).total_seconds()
        return int(duration)

    def _calculate_distance(self):
        """
        Approximate distance (km) by summing Speed * Time_Diff.
        Speed is in km/h, Time_Diff is in seconds -> convert to hours.
        """
        regen_distance = (
            self.csv_regen["Speed"] * self.csv_regen["Time_Diff"]
        ) / 3600.0
        regen_distance_sum = regen_distance.sum()
        return float(round(regen_distance_sum, 1))

    def _calculate_speed(self):
        if self.csv_regen is None:
            return None
        return {
            "min": float(round(self.csv_regen["Speed"].min(), 2)),
            "max": float(round(self.csv_regen["Speed"].max(), 2)),
            "avg": float(round(self.csv_regen["Speed"].mean(), 2)),
        }

    def _calculate_fap_temp(self):
        if self.csv_regen is None:
            return None
        return {
            "min": float(round(self.csv_regen["FAPtemp"].min(), 2)),
            "max": float(round(self.csv_regen["FAPtemp"].max(), 2)),
            "avg": float(round(self.csv_regen["FAPtemp"].mean(), 2)),
        }

    def _calculate_fap_pressure(self):
        if self.csv_regen is None:
            return None
        return {
            "min": float(round(self.csv_regen["FAPpressure"].min(), 2)),
            "max": float(round(self.csv_regen["FAPpressure"].max(), 2)),
            "avg": float(round(self.csv_regen["FAPpressure"].mean(), 2)),
        }

    def _calculate_revs(self):
        if self.csv_regen is None:
            return None
        return {
            "min": float(round(self.csv_regen["Revs"].min(), 2)),
            "max": float(round(self.csv_regen["Revs"].max(), 2)),
            "avg": float(round(self.csv_regen["Revs"].mean(), 2)),
        }

    def _calculate_fap_soot(self):
        if self.csv_regen is None or self.csv_regen["FAPsoot"].dropna().empty:
            return None

        soot_series = self.csv_regen["FAPsoot"].dropna()
        start = soot_series.iloc[0]
        end = soot_series.iloc[-1]
        diff = float(round(end - start, 2))

        return {
            "start": float(round(start, 2)),
            "end": float(round(end, 2)),
            "diff": diff,
        }

    def _calculate_fuel(self):
        if (
            "InjFlow" not in self.csv
            or "Revs" not in self.csv
            or "Speed" not in self.csv
        ):
            return {"regen": None, "non-regen": None}

        diesel_density = 0.8375
        cylinders = 4

        self.csv["FuelFlow_mg_per_min"] = (
            self.csv["InjFlow"] * self.csv["Revs"] * (cylinders / 2)
        )
        self.csv["FuelFlow_L_per_min"] = (
            self.csv["FuelFlow_mg_per_min"] / 1e6 / diesel_density
        )

        self.csv["FuelConsumption_L_per_100km"] = (
            (self.csv["FuelFlow_L_per_min"] * 60) / self.csv["Speed"] * 100
        )
        self.csv["FuelConsumption_L_per_100km"] = self.csv[
            "FuelConsumption_L_per_100km"
        ].replace([float("inf"), -float("inf")], pd.NA)

        regen_on = self.csv[self.csv["REGEN"] == 1]["FuelConsumption_L_per_100km"]
        regen_off = self.csv[self.csv["REGEN"] == 0]["FuelConsumption_L_per_100km"]

        return {
            "regen": (
                float(round(regen_on.mean(skipna=True), 2))
                if not regen_on.empty
                else None
            ),
            "non-regen": (
                float(round(regen_off.mean(skipna=True), 2))
                if not regen_off.empty
                else None
            ),
        }


if __name__ == "__main__":
    file_path = "backend/analyser/data/DCM62v2_20250328.csv"
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
