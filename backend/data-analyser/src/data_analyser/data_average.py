import pandas as pd
from logger_setup import setup_logger

from data_analyser.constants.common import range_labels
from data_analyser.exceptions.exceptions import DataAverageException

# Set up logger for this module
logger = setup_logger(__name__)


class DataAverage:
    def __init__(self, analyses):
        logger.info("Loading data for average calculation")

        try:
            # Normalize the nested structure into flat columns
            # E.g. "overall.distance" becomes a seperate column
            self.analyses = pd.json_normalize(analyses)
        except Exception as e:
            logger.error(
                f"Failed to read data for average calculation: {str(e)}",
                exc_info=True,
            )
            raise DataAverageException("Failed to read data for average calculation.")

        logger.info("Calculating average")

        try:
            self.result = self._calculate_result()
        except Exception as e:
            logger.error(f"Failed to calculate average: {str(e)}", exc_info=True)
            raise DataAverageException("Failed to calculate average.")

        logger.info("Average calculation completed")

    def _calculate(self, key, operation, round_digits=0):
        # Available operations: 'sum', 'mean', 'min', 'max'
        column = self.analyses.get(key)
        if column is None or column.empty:
            return None

        value = getattr(column, operation)()
        if value is None or pd.isna(value):
            return None
        if round_digits:
            return float(round(value, round_digits))
        return int(value)

    def _calculate_result(self):
        overall = self._calculate_overall()
        driving = self._calculate_driving()
        engine = self._calculate_engine()
        fap = self._calculate_fap()
        fap_regen = self._calculate_fap_regen()
        fuel = self._calculate_fuel()

        return {
            "overall": overall,
            "driving": driving,
            "engine": engine,
            "fap": fap,
            "fapRegen": fap_regen,
            "fuelConsumption": fuel,
        }

    def _calculate_overall(self):
        return {
            "distance_km": self._calculate("overall.distance_km", "sum", 2),
            "duration": {
                "overall_sec": self._calculate("overall.duration.overall_sec", "sum"),
                "engineOn_sec": self._calculate("overall.duration.engineOn_sec", "sum"),
                "engineOff_sec": self._calculate(
                    "overall.duration.engineOff_sec", "sum"
                ),
                "idle_sec": self._calculate("overall.duration.idle_sec", "sum"),
                "driving_sec": self._calculate("overall.duration.driving_sec", "sum"),
            },
        }

    def _calculate_driving(self):
        return {
            "acceleration": {
                "max_perc": self._calculate("driving.acceleration.max_perc", "max"),
                "avg_perc": self._weighted_average(
                    "driving.acceleration.avg_perc", "overall.duration.driving_sec"
                ),
            },
            "revs": {
                "min": self._calculate("driving.revs.min", "min"),
                "max": self._calculate("driving.revs.max", "max"),
                "avg": self._weighted_average(
                    "driving.revs.avg", "overall.duration.driving_sec"
                ),
                "avgDriving": self._weighted_average(
                    "driving.revs.avgDriving", "overall.duration.driving_sec"
                ),
            },
            "speed": {
                "avg_kmh": self._weighted_average(
                    "driving.speed.avg_kmh", "overall.duration.driving_sec"
                ),
                "max_kmh": self._calculate("driving.speed.max_kmh", "max"),
            },
        }

    def _calculate_engine(self):
        return {
            "battery": {
                "beforeDrive_v": self._calculate(
                    "engine.battery.beforeDrive_v", "mean", 2
                ),
                "engineRunning_v": self._weighted_average(
                    "engine.battery.engineRunning_v",
                    "overall.duration.engineOn_sec",
                    2,
                ),
            },
            "coolantTemp": {
                "min_c": self._calculate("engine.coolantTemp.min_c", "min"),
                "max_c": self._calculate("engine.coolantTemp.max_c", "max"),
                "avg_c": self._weighted_average(
                    "engine.coolantTemp.avg_c", "overall.duration.engineOn_sec"
                ),
            },
            "engineWarmup": {
                "coolant_sec": self._calculate(
                    "engine.engineWarmup.coolant_sec", "mean", 2
                ),
                "oil_sec": self._calculate("engine.engineWarmup.oil_sec", "mean", 2),
            },
            "errors": {
                "min": self._calculate("engine.errors", "min"),
                "max": self._calculate("engine.errors", "max"),
            },
            "oilCarbonate": {
                "min_perc": self._calculate("engine.oilCarbonate_perc", "min"),
                "max_perc": self._calculate("engine.oilCarbonate_perc", "max"),
            },
            "oilDilution": {
                "min_perc": self._calculate("engine.oilDilution_perc", "min"),
                "max_perc": self._calculate("engine.oilDilution_perc", "max"),
            },
            "oilTemp": {
                "min_c": self._calculate("engine.oilTemp.min_c", "min"),
                "max_c": self._calculate("engine.oilTemp.max_c", "max"),
                "avg_c": self._weighted_average(
                    "engine.oilTemp.avg_c", "overall.duration.engineOn_sec"
                ),
            },
        }

    def _calculate_fap(self):
        return {
            "pressure": {
                "min_mbar": self._calculate("fap.pressure.min_mbar", "min"),
                "max_mbar": self._calculate("fap.pressure.max_mbar", "max"),
                "avg_mbar": self._weighted_average(
                    "fap.pressure.avg_mbar", "overall.duration.engineOn_sec"
                ),
            },
            "pressure_idle": {
                "avg_mbar": self._weighted_average(
                    "fap.pressure_idle.avg_mbar", "overall.duration.idle_sec"
                ),
            },
            "temp": {
                "min_c": self._calculate("fap.temp.min_c", "min"),
                "max_c": self._calculate("fap.temp.max_c", "max"),
                "avg_c": self._weighted_average(
                    "fap.temp.avg_c", "overall.duration.engineOn_sec"
                ),
            },
        }

    def _calculate_fap_regen(self):
        fap_regen_duration = self.analyses.get("fapRegen.duration_sec")
        if fap_regen_duration is None or fap_regen_duration.empty:
            return None

        return {
            "numberOfRegens": fap_regen_duration.dropna().shape[0],
            "previousRegen_km": self._calculate("fapRegen.previousRegen_km", "mean", 2),
            "duration_sec": self._calculate("fapRegen.duration_sec", "mean", 2),
            "distance_km": self._weighted_average(
                "fapRegen.distance_km", "fapRegen.duration_sec", 2
            ),
            "speed": {
                "min_kmh": self._calculate("fapRegen.speed.min_kmh", "min"),
                "max_kmh": self._calculate("fapRegen.speed.max_kmh", "max"),
                "avg_kmh": self._weighted_average(
                    "fapRegen.speed.avg_kmh", "fapRegen.duration_sec"
                ),
            },
            "fapTemp": {
                "min_c": self._calculate("fapRegen.fapTemp.min_c", "min"),
                "max_c": self._calculate("fapRegen.fapTemp.max_c", "max"),
                "avg_c": self._weighted_average(
                    "fapRegen.fapTemp.avg_c", "fapRegen.duration_sec"
                ),
            },
            "fapPressure": {
                "min_mbar": self._calculate("fapRegen.fapPressure.min_mbar", "min"),
                "max_mbar": self._calculate("fapRegen.fapPressure.max_mbar", "max"),
                "avg_mbar": self._weighted_average(
                    "fapRegen.fapPressure.avg_mbar", "fapRegen.duration_sec"
                ),
            },
            "revs": {
                "min": self._calculate("fapRegen.revs.min", "min"),
                "max": self._calculate("fapRegen.revs.max", "max"),
                "avg": self._weighted_average(
                    "fapRegen.revs.avg", "fapRegen.duration_sec"
                ),
            },
            "fapSoot": {
                "start_gl": self._calculate("fapRegen.fapSoot.start_gl", "mean", 2),
                "end_gl": self._calculate("fapRegen.fapSoot.end_gl", "mean", 2),
            },
            "fuelConsumption": {
                "regen_l100km": self._weighted_average(
                    "fapRegen.fuelConsumption.regen_l100km", "fapRegen.duration_sec", 2
                ),
                "nonRegen_l100km": self._weighted_average(
                    "fapRegen.fuelConsumption.nonRegen_l100km",
                    "fapRegen.duration_sec",
                    2,
                ),
            },
        }

    def _calculate_fuel(self):
        by_speed_range = {}
        for label in range_labels:
            avg_l100km = self._weighted_average(
                f"fuelConsumption.bySpeedRange.{label}_l100km",
                f"fuelConsumption.bySpeedRange._{label}_km",
                2,
            )
            # Only add if at least one value is not None
            if avg_l100km is not None:
                by_speed_range[f"{label}_l100km"] = avg_l100km

        return {
            "overall": {
                "total_l": self._calculate("fuelConsumption.overall.total_l", "sum"),
                "avg_l100km": self._weighted_average(
                    "fuelConsumption.overall.avg_l100km", "overall.distance_km", 2
                ),
            },
            "bySpeedRange": by_speed_range,
        }

    def _weighted_average(self, values_key, weights_key, round_digits=0):
        values = self.analyses.get(values_key)
        weights = self.analyses.get(weights_key)

        if values is None or weights is None or values.empty or weights.empty:
            return None

        total_weight = weights.sum()
        if total_weight == 0:
            return None

        value = (values * weights).sum() / total_weight
        if pd.isna(value):
            return None

        if round_digits:
            return float(round(value, round_digits))
        return int(value)


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # export STORAGE_PATH=../data/ds4
    # Usage: python -m data_analyser.data_average
    import os
    from time import time

    from data_analyser.data_analyser import DataAnalyser

    data_dir = "../data/ds4/"
    csv_files = [
        os.path.splitext(f)[0] for f in os.listdir(data_dir) if f.endswith(".csv")
    ]
    analysys = []
    for file_name in csv_files:
        logger.info(f"Processing file: {file_name}")
        analysys.append(DataAnalyser(file_name).result)

    start = time()
    dataAverage = DataAverage(analysys)
    end = time()
    logger.info(f"Average: {dataAverage.result}")
    logger.info(f"Processing time: {end - start} seconds")

    # fapLogAnalyse1 = DataAnalyser("HDI_SID807_BR2_20250326")
    # fapLogAnalyse2 = DataAnalyser("HDI_SID807_BR2_20250324")
    # print(fapLogAnalyse1)
    # print(fapLogAnalyse2)
    # dataAverage = DataAverage([fapLogAnalyse1.result, fapLogAnalyse2.result])
    # logger.info(f"Average: {dataAverage.result}")
