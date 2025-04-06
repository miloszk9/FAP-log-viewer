import pandas as pd
from json import dumps


class FapRegenParameters:
    def __init__(self, file_path):
        self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
        self._process_data()
        self.result = {
            "distance": self._calculate_distance(),
            "duration": self._calculate_duration_sec(),
            "fapPressure": self._calculate_fap_pressure(),
            "fapSoot": self._calculate_fap_soot(),
            "fapTemp": self._calculate_fap_temp(),
            "fuelConsumption": self._calculate_fuel(),
            "lastRegen": self._calculate_last_regen(),
            "revs": self._calculate_revs(),
            "speed": self._calculate_speed(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _process_data(self):
        """Convert necessary columns to numeric where applicable."""
        numeric_columns = [
            "FAPpressure",
            "FAPtemp",
            "FAPsoot",
            "LastRegen",
            "Avg10regen",
            "Revs",
            "Speed",
            "InjFlow",
        ]
        for col in numeric_columns:
            if col in self.csv.columns:
                self.csv[col] = pd.to_numeric(self.csv[col], errors="coerce")

    def _calculate_distance(self):
        return 0

    def _calculate_duration_sec(self):
        return 0

    def _calculate_fap_pressure(self):
        return {"avg": 0, "min": 0, "max": 0}

    def _calculate_fap_soot(self):
        return {"diff": 0, "end": 0, "start": 0}

    def _calculate_fap_temp(self):
        return {"avg": 0, "min": 0, "max": 0}

    def _calculate_fuel(self):
        return {"regen": 0, "non-regen": 0}

    def _calculate_soot(self):
        return {"start": 0, "end": 0, "diff": 0}

    def _calculate_last_regen(self):
        return 0

    def _calculate_revs(self):
        return {"min": "", "max": "", "avg": ""}

    def _calculate_speed(self):
        return {"min": "", "max": "", "avg": ""}


if __name__ == "__main__":
    fapRegenParameters = FapRegenParameters(
        "backend/analyser/data/DCM62v2_20250328.csv"
    )
    print(fapRegenParameters)
