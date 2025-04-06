import pandas as pd
from json import dumps


class EngineParameters:
    def __init__(self, file_path):
        self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
        self._process_data()
        self.result = {
            "battery": self._calculate_battery(),
            "coolantTemp": self._calculate_coolant_temp(),
            "engineWarmup": self._calculate_warmup_time(),
            "errors": self._calculate_errors(),
            "oilCarbonate": self._calculate_oil_carbonate(),
            "oilDilution": self._calculate_oil_dilution(),
            "oilTemp": self._calculate_oil_temp(),
        }
        print(self.result)

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _process_data(self):
        """Convert relevant columns to numeric. Parse Time as seconds since start."""
        cols = [
            "Coolant",
            "OilTemp",
            "OilDilution",
            "OilCarbonate",
            "Battery",
            "Errors",
            "EngineStatus",
            "Revs",
        ]

        for col in cols:
            if col in self.csv.columns:
                self.csv[col] = pd.to_numeric(self.csv[col], errors="coerce")

        # Parse Time column
        if "Time" in self.csv.columns:
            self.csv["TimeParsed"] = pd.to_datetime(
                self.csv["Time"], format="%H:%M:%S.%f", errors="coerce"
            )
            first_time = self.csv["TimeParsed"].dropna().iloc[0]
            self.csv["Time"] = (self.csv["TimeParsed"] - first_time).dt.total_seconds()

    def _calculate_coolant_temp(self):
        csv = self.csv.dropna(subset=["Coolant"])
        return {
            "min": round(csv["Coolant"].min()),
            "max": round(csv["Coolant"].max()),
            "avg": round(csv["Coolant"].mean()),
        }

    def _calculate_oil_temp(self):
        csv = self.csv.dropna(subset=["OilTemp"])
        return {
            "min": round(csv["OilTemp"].min()),
            "max": round(csv["OilTemp"].max()),
            "avg": round(csv["OilTemp"].mean()),
        }

    def _calculate_oil_dilution(self):
        if "OilDilution" not in self.csv.columns:
            return None
        return round(self.csv["OilDilution"].mean())

    def _calculate_oil_carbonate(self):
        if "OilCarbon" not in self.csv.columns:
            return None
        return round(self.csv["OilCarbon"].mean())

    def _calculate_battery(self):
        if "Revs" not in self.csv.columns or "Battery" not in self.csv.columns:
            return None

        # Find the index of the first engine start (Revs > 0)
        first_start_index = self.csv[self.csv["Revs"] > 0].first_valid_index()

        if first_start_index is None:
            # Engine never started, all data is before drive
            before_drive = self.csv[self.csv["Revs"] == 0]["Battery"].dropna()
            return {
                "beforeDrive": {
                    "min": round(before_drive.min(), 2),
                    "max": round(before_drive.max(), 2),
                    "avg": round(before_drive.mean(), 2),
                },
                "engineRunning": None,
            }

        # Battery readings before first engine start
        before_drive = self.csv.loc[: first_start_index - 1]
        before_drive = before_drive[before_drive["Revs"] == 0]["Battery"].dropna()

        # Battery readings while engine running (Revs > 0)
        engine_running = self.csv[self.csv["Revs"] > 0]["Battery"].dropna()

        return {
            "beforeDrive": {
                "min": round(before_drive.min(), 2) if not before_drive.empty else None,
                "max": round(before_drive.max(), 2) if not before_drive.empty else None,
                "avg": (
                    round(before_drive.mean(), 2) if not before_drive.empty else None
                ),
            },
            "engineRunning": {
                "min": (
                    round(engine_running.min(), 2) if not engine_running.empty else None
                ),
                "max": (
                    round(engine_running.max(), 2) if not engine_running.empty else None
                ),
                "avg": (
                    round(engine_running.mean(), 2)
                    if not engine_running.empty
                    else None
                ),
            },
        }

    def _calculate_warmup_time(self):
        """Calculate warmup time (minutes) for coolant and oil after cold start."""
        csv_valid = self.csv.dropna(subset=["Time", "Coolant", "OilTemp"])

        # Detect first cold start: either Coolant or OilTemp is below 50°C
        initial_state = (
            csv_valid[(csv_valid["Coolant"] < 50) | (csv_valid["OilTemp"] < 50)]
            .sort_values("Time")
            .head(1)
        )

        if initial_state.empty:
            print("⚠️ No cold start found.")
            return {"coolant": None, "oil": None}

        start_time = initial_state["Time"].iloc[0]
        print(f"🚗 Cold start detected at time: {start_time}s")

        # Look for warmup *after* cold start
        after_start = csv_valid[csv_valid["Time"] >= start_time]

        coolant_warm_time = after_start[after_start["Coolant"] >= 80]["Time"].min()
        oil_warm_time = after_start[after_start["OilTemp"] >= 90]["Time"].min()

        coolant_warmup_duration = (
            coolant_warm_time - start_time if pd.notna(coolant_warm_time) else None
        )
        oil_warmup_duration = (
            oil_warm_time - start_time if pd.notna(oil_warm_time) else None
        )

        return {
            "coolant": (
                round(coolant_warmup_duration / 60, 2)
                if coolant_warmup_duration is not None
                else None
            ),
            "oil": (
                round(oil_warmup_duration / 60, 2)
                if oil_warmup_duration is not None
                else None
            ),
        }

    def _calculate_errors(self):
        if "Errors" not in self.csv.columns:
            return None
        return int(self.csv["Errors"].max())


if __name__ == "__main__":
    engineParameters = EngineParameters("backend/analyser/data/DCM62v2_20250328.csv")
    print(engineParameters)
