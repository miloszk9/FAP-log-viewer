import pandas as pd
from logger_setup import setup_logger

from data_analyser.data_analyser import DataAnalyser
from data_analyser.exceptions.exceptions import DataAverageException

# Set up logger for this module
logger = setup_logger(__name__)


class DataAverage:
    def __init__(self, single_analyses):
        logger.info("Loading data for average calculation")

        try:
            # Normalize the nested structure into flat columns
            # E.g. "overall.distance" becomes a seperate column
            self.single_analyses = pd.json_normalize(single_analyses)
        except Exception as e:
            logger.error(
                f"Failed to read data for average calculation: {str(e)}",
                exc_info=True,
            )
            raise DataAverageException("Failed to read data for average calculation.")

        logger.info("Calculating average")

        try:
            self.user_analysis = self._calculate_user_analysis()
        except Exception as e:
            logger.error(f"Failed to calculate average: {str(e)}", exc_info=True)
            raise DataAverageException("Failed to calculate average.")

        logger.info("Average calculation completed")

    def _calculate_user_analysis(self):
        overall = self._calculate_overall()
        driving = self._calculate_driving()
        # engine = self._calculate_engine()
        # fap = self._calculate_fap()
        # fap_regen = self._calculate_fap_regen()

        return {
            "overall": overall,
            "driving": driving,
            # "engine": engine,
            # "fap": fap,
            # "fapRegen": fap_regen,
        }

    def _calculate_overall(self):
        return {
            "distance": float(self.single_analyses["overall.distance"].sum()),
            "duration": {
                "overall": int(self.single_analyses["overall.duration.overall"].sum()),
                "engineOn": int(
                    self.single_analyses["overall.duration.engineOn"].sum()
                ),
                "engineOff": int(
                    self.single_analyses["overall.duration.engineOff"].sum()
                ),
                "idle": int(self.single_analyses["overall.duration.idle"].sum()),
                "driving": int(self.single_analyses["overall.duration.driving"].sum()),
            },
        }

    def _calculate_driving(self):
        acceleration_avg = self._weighted_average(
            self.single_analyses["driving.acceleration.avg"],
            self.single_analyses["overall.duration.driving"],
        )
        acceleration_avg = int(round(acceleration_avg)) if acceleration_avg else None
        fuel_consumption_avg = self._weighted_average(
            self.single_analyses["driving.fuelConsumption.per_100km"],
            self.single_analyses["overall.distance"],
        )
        fuel_consumption_avg = (
            float(round(fuel_consumption_avg, 2)) if fuel_consumption_avg else None
        )
        revs_avg = self._weighted_average(
            self.single_analyses["driving.revs.avg"],
            self.single_analyses["overall.duration.driving"],
        )
        revs_avg = int(round(revs_avg)) if revs_avg else None
        revs_driving_avg = self._weighted_average(
            self.single_analyses["driving.revs.avgDriving"],
            self.single_analyses["overall.duration.driving"],
        )
        revs_driving_avg = int(round(revs_driving_avg)) if revs_driving_avg else None
        speed_avg = self._weighted_average(
            self.single_analyses["driving.speed.avg"],
            self.single_analyses["overall.duration.driving"],
        )
        speed_avg = float(round(speed_avg, 2)) if speed_avg else None

        return {
            "acceleration": {
                "max": float(self.single_analyses["driving.acceleration.max"].max()),
                "avg": acceleration_avg,
            },
            "fuelConsumption": {
                "total": float(self.single_analyses["driving.fuelConsumption.liters"].sum()),
                "avg": fuel_consumption_avg
            },
            "revs": {
                "min": int(self.single_analyses["driving.revs.min"].min()),
                "max": int(self.single_analyses["driving.revs.max"].max()),
                "avg": revs_avg,
                "avgDriving": revs_driving_avg,
            },
            "speed": {
                "avg": speed_avg,
                "max": float(self.single_analyses["driving.speed.max"].max()),
            },
        }

    def _weighted_average(self, values, weights):
        total_weight = weights.sum()
        if total_weight == 0:
            return None
        return (values * weights).sum() / total_weight


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # export STORAGE_PATH=../data/ds4
    # Usage: python -m data_analyser.data_average
    fapLogAnalyse1 = DataAnalyser("DCM62v2_20250311")
    fapLogAnalyse2 = DataAnalyser("DCM62v2_20250328")
    print(fapLogAnalyse1)
    print(fapLogAnalyse2)
    dataAverage = DataAverage([fapLogAnalyse1.result, fapLogAnalyse2.result])
    logger.info(f"Average: {dataAverage.user_analysis}")
