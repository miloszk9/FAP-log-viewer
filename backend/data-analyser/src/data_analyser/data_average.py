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
                "total": float(
                    self.single_analyses["driving.fuelConsumption.liters"].sum()
                ),
                "avg": fuel_consumption_avg,
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

    def _calculate_engine(self):
        battery_before_drive_avg = self.single_analyses[
            "engine.battery.beforeDrive.avg"
        ].mean()
        battery_before_drive_avg = float(round(battery_before_drive_avg, 2))
        engineRunning_avg = self._weighted_average(
            self.single_analyses["engine.battery.engineRunning.avg"],
            self.single_analyses["overall.duration.engineOn"],
        )
        engineRunning_avg = (
            float(round(engineRunning_avg, 2)) if engineRunning_avg else None
        )
        coolantTemp_avg = self._weighted_average(
            self.single_analyses["engine.coolantTemp.avg"],
            self.single_analyses["overall.duration.engineOn"],
        )
        coolantTemp_avg = float(round(coolantTemp_avg, 2)) if coolantTemp_avg else None
        oilTemp_avg = self._weighted_average(
            self.single_analyses["engine.oilTemp.avg"],
            self.single_analyses["overall.duration.engineOn"],
        )
        oilTemp_avg = float(round(oilTemp_avg, 2)) if oilTemp_avg else None

        return {
            "battery": {
                "beforeDrive": {"avg": battery_before_drive_avg},
                "engineRunning": {"avg": engineRunning_avg},
            },
            "coolantTemp": {
                "min": float(self.single_analyses["engine.coolantTemp.min"].min()),
                "max": float(self.single_analyses["engine.coolantTemp.max"].max()),
                "avg": coolantTemp_avg,
            },
            "engineWarmup": {
                "coolant": float(
                    self.single_analyses["engine.engineWarmup.coolant"].mean()
                ),
                "oil": float(self.single_analyses["engine.engineWarmup.oil"].mean()),
            },
            "errors": {
                "min": int(self.single_analyses["engine.errors"].min()),
                "max": int(self.single_analyses["engine.errors"].max()),
            },
            "oilCarbonate": {
                "min": int(self.single_analyses["engine.oilCarbonate"].min()),
                "max": int(self.single_analyses["engine.oilCarbonate"].max()),
            },
            "oilDilution": {
                "min": int(self.single_analyses["engine.oilDilution"].min()),
                "max": int(self.single_analyses["engine.oilDilution"].max()),
            },
            "oilTemp": {
                "min": int(self.single_analyses["engine.oilTemp.min"].min()),
                "max": int(self.single_analyses["engine.oilTemp.max"].max()),
                "avg": oilTemp_avg,
            },
        }

    def _calculate_fap(self):
        pressure_avg = self._weighted_average(
            self.single_analyses["fap.pressure.avg"],
            self.single_analyses["overall.duration.engineOn"],
        )
        pressure_avg = float(round(pressure_avg, 2)) if pressure_avg else None
        pressure_idle_avg = self._weighted_average(
            self.single_analyses["fap.pressure_idle.avg"],
            self.single_analyses["overall.duration.idle"],
        )
        pressure_idle_avg = (
            float(round(pressure_idle_avg, 2)) if pressure_idle_avg else None
        )
        temp_avg = self._weighted_average(
            self.single_analyses["fap.temp.avg"],
            self.single_analyses["overall.duration.engineOn"],
        )
        temp_avg = float(round(temp_avg, 2)) if temp_avg else None

        return {
            "pressure": {
                "min": float(self.single_analyses["fap.pressure.min"].min()),
                "max": float(self.single_analyses["fap.pressure.max"].max()),
                "avg": pressure_avg,
            },
            "pressure_idle": {
                "avg": pressure_idle_avg,
            },
            "temp": {
                "min": float(self.single_analyses["fap.temp.min"].min()),
                "max": float(self.single_analyses["fap.temp.max"].max()),
                "avg": temp_avg,
            },
        }

    def _calculate_fap_regen(self):
        duration = self.single_analyses["fapRegen.duration"]
        distance_avg = self._weighted_average(
            self.single_analyses["fapRegen.distance"], duration
        )
        distance_avg = float(round(distance_avg, 2)) if distance_avg else None
        speed_avg = self._weighted_average(
            self.single_analyses["fapRegen.speed.avg"], duration
        )
        speed_avg = float(round(speed_avg, 2)) if speed_avg else None
        fap_temp_avg = self._weighted_average(
            self.single_analyses["fapRegen.fapTemp.avg"], duration
        )
        fap_temp_avg = float(round(fap_temp_avg, 2)) if fap_temp_avg else None
        fap_pressure_avg = self._weighted_average(
            self.single_analyses["fapRegen.fapPressure.avg"], duration
        )
        fap_pressure_avg = (
            float(round(fap_pressure_avg, 2)) if fap_pressure_avg else None
        )
        revs_avg = self._weighted_average(
            self.single_analyses["fapRegen.revs.avg"], duration
        )
        revs_avg = int(round(revs_avg)) if revs_avg else None
        fap_soot_start_avg = self.single_analyses["fapRegen.fapSoot.start"].mean()
        fap_soot_start_avg = (
            float(round(fap_soot_start_avg, 2)) if fap_soot_start_avg else None
        )
        fap_soot_end_avg = self.single_analyses["fapRegen.fapSoot.end"].mean()
        fap_soot_end_avg = (
            float(round(fap_soot_end_avg, 2)) if fap_soot_end_avg else None
        )
        fuel_consumption_regen_avg = self._weighted_average(
            self.single_analyses["fapRegen.fuelConsumption.regen"], duration
        )
        fuel_consumption_regen_avg = float(round(fuel_consumption_regen_avg, 2))
        fuel_consumption_non_regen_avg = self._weighted_average(
            self.single_analyses["fapRegen.fuelConsumption.non-regen"], duration
        )
        fuel_consumption_non_regen_avg = float(round(fuel_consumption_non_regen_avg, 2))

        return {
            "previousRegen": int(self.single_analyses["fapRegen.previousRegen"].mean()),
            "duration": int(duration.mean()),
            "distance": distance_avg,
            "speed": {
                "min": float(self.single_analyses["fapRegen.speed.min"].min()),
                "max": float(self.single_analyses["fapRegen.speed.max"].max()),
                "avg": speed_avg,
            },
            "fapTemp": {
                "min": float(self.single_analyses["fapRegen.fapTemp.min"].min()),
                "max": float(self.single_analyses["fapRegen.fapTemp.max"].max()),
                "avg": fap_temp_avg,
            },
            "fapPressure": {
                "min": float(self.single_analyses["fapRegen.fapPressure.min"].min()),
                "max": float(self.single_analyses["fapRegen.fapPressure.max"].max()),
                "avg": fap_pressure_avg,
            },
            "revs": {
                "min": int(self.single_analyses["fapRegen.revs.min"].min()),
                "max": int(self.single_analyses["fapRegen.revs.max"].max()),
                "avg": revs_avg,
            },
            "fapSoot": {
                "start": fap_soot_start_avg,
                "end": fap_soot_end_avg,
            },
            "fuelConsumption": {
                "regen": fuel_consumption_regen_avg,
                "non-regen": fuel_consumption_non_regen_avg,
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
