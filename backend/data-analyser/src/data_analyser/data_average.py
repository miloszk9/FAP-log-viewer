import pandas as pd
from logger_setup import setup_logger

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

        return {
            "overall": overall,
            "driving": driving,
            "engine": engine,
            "fap": fap,
            "fapRegen": fap_regen,
        }

    def _calculate_overall(self):
        return {
            "distance": self._calculate("overall.distance", "sum", 2),
            "duration": {
                "overall": self._calculate("overall.duration.overall", "sum"),
                "engineOn": self._calculate("overall.duration.engineOn", "sum"),
                "engineOff": self._calculate("overall.duration.engineOff", "sum"),
                "idle": self._calculate("overall.duration.idle", "sum"),
                "driving": self._calculate("overall.duration.driving", "sum"),
            },
        }

    def _calculate_driving(self):
        return {
            "acceleration": {
                "max": self._calculate("driving.acceleration.max", "max", None),
                "avg": self._weighted_average(
                    "driving.acceleration.avg", "overall.duration.driving"
                ),
            },
            "fuelConsumption": {
                "total": self._calculate("driving.fuelConsumption.liters", "sum"),
                "avg": self._weighted_average(
                    "driving.fuelConsumption.per_100km", "overall.distance", 2
                ),
            },
            "revs": {
                "min": self._calculate("driving.revs.min", "min"),
                "max": self._calculate("driving.revs.max", "max"),
                "avg": self._weighted_average(
                    "driving.revs.avg", "overall.duration.driving"
                ),
                "avgDriving": self._weighted_average(
                    "driving.revs.avgDriving", "overall.duration.driving"
                ),
            },
            "speed": {
                "avg": self._weighted_average(
                    "driving.speed.avg", "overall.duration.driving", 2
                ),
                "max": self._calculate("driving.speed.max", "max"),
            },
        }

    def _calculate_engine(self):
        return {
            "battery": {
                "beforeDrive": {
                    "avg": self._calculate("engine.battery.beforeDrive.avg", "mean", 2)
                },
                "engineRunning": {
                    "avg": self._weighted_average(
                        "engine.battery.engineRunning.avg",
                        "overall.duration.engineOn",
                        2,
                    )
                },
            },
            "coolantTemp": {
                "min": self._calculate("engine.coolantTemp.min", "min"),
                "max": self._calculate("engine.coolantTemp.max", "max"),
                "avg": self._weighted_average(
                    "engine.coolantTemp.avg", "overall.duration.engineOn", 2
                ),
            },
            "engineWarmup": {
                "coolant": self._calculate("engine.engineWarmup.coolant", "mean", 2),
                "oil": self._calculate("engine.engineWarmup.oil", "mean", 2),
            },
            "errors": {
                "min": self._calculate("engine.errors", "min"),
                "max": self._calculate("engine.errors", "max"),
            },
            "oilCarbonate": {
                "min": self._calculate("engine.oilCarbonate", "min"),
                "max": self._calculate("engine.oilCarbonate", "max"),
            },
            "oilDilution": {
                "min": self._calculate("engine.oilDilution", "min"),
                "max": self._calculate("engine.oilDilution", "max"),
            },
            "oilTemp": {
                "min": self._calculate("engine.oilTemp.min", "min"),
                "max": self._calculate("engine.oilTemp.max", "max"),
                "avg": self._weighted_average(
                    "engine.oilTemp.avg", "overall.duration.engineOn", 2
                ),
            },
        }

    def _calculate_fap(self):
        return {
            "pressure": {
                "min": self._calculate("fap.pressure.min", "min"),
                "max": self._calculate("fap.pressure.max", "max"),
                "avg": self._weighted_average(
                    "fap.pressure.avg", "overall.duration.engineOn", 2
                ),
            },
            "pressure_idle": {
                "avg": self._weighted_average(
                    "fap.pressure_idle.avg", "overall.duration.idle", 2
                ),
            },
            "temp": {
                "min": self._calculate("fap.temp.min", "min"),
                "max": self._calculate("fap.temp.max", "max"),
                "avg": self._weighted_average(
                    "fap.temp.avg", "overall.duration.engineOn", 2
                ),
            },
        }

    def _calculate_fap_regen(self):
        if not self.analyses.get("fapRegen.duration"):
            return None

        return {
            "previousRegen": self._calculate("fapRegen.previousRegen", "mean", 2),
            "duration": self._calculate("fapRegen.duration", "mean", 2),
            "distance": self._weighted_average(
                "fapRegen.distance", "fapRegen.duration", 2
            ),
            "speed": {
                "min": self._calculate("fapRegen.speed.min", "min"),
                "max": self._calculate("fapRegen.speed.max", "max"),
                "avg": self._weighted_average(
                    "fapRegen.speed.avg", "fapRegen.duration", 2
                ),
            },
            "fapTemp": {
                "min": self._calculate("fapRegen.fapTemp.min", "min"),
                "max": self._calculate("fapRegen.fapTemp.max", "max"),
                "avg": self._weighted_average(
                    "fapRegen.fapTemp.avg", "fapRegen.duration", 2
                ),
            },
            "fapPressure": {
                "min": self._calculate("fapRegen.fapPressure.min", "min"),
                "max": self._calculate("fapRegen.fapPressure.max", "max"),
                "avg": self._weighted_average(
                    "fapRegen.fapPressure.avg", "fapRegen.duration", 2
                ),
            },
            "revs": {
                "min": self._calculate("fapRegen.revs.min", "min"),
                "max": self._calculate("fapRegen.revs.max", "max"),
                "avg": self._weighted_average("fapRegen.revs.avg", "fapRegen.duration"),
            },
            "fapSoot": {
                "start": self._calculate("fapRegen.fapSoot.start", "mean", 2),
                "end": self._calculate("fapRegen.fapSoot.end", "mean", 2),
            },
            "fuelConsumption": {
                "regen": self._weighted_average(
                    "fapRegen.fuelConsumption.regen", "fapRegen.duration", 2
                ),
                "non-regen": self._weighted_average(
                    "fapRegen.fuelConsumption.non-regen", "fapRegen.duration", 2
                ),
            },
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
    from data_analyser.data_analyser import DataAnalyser
    # import os
    # from time import time

    # data_dir = "../data/ds4/"
    # csv_files = [
    #     os.path.splitext(f)[0] for f in os.listdir(data_dir) if f.endswith(".csv")
    # ]
    # analysys = []
    # for file_name in csv_files:
    #     logger.info(f"Processing file: {file_name}")
    #     analysys.append(DataAnalyser(file_name).result)

    # start = time()
    # dataAverage = DataAverage(analysys)
    # end = time()
    # logger.info(f"Average: {dataAverage.result}")
    # logger.info(f"Processing time: {end - start} seconds")

    fapLogAnalyse1 = DataAnalyser("HDI_SID807_BR2_20250326")
    fapLogAnalyse2 = DataAnalyser("HDI_SID807_BR2_20250324")
    print(fapLogAnalyse1)
    print(fapLogAnalyse2)
    dataAverage = DataAverage([fapLogAnalyse1.result, fapLogAnalyse2.result])
    logger.info(f"Average: {dataAverage.result}")
