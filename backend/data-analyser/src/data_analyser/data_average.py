import pandas as pd
from logger_setup import setup_logger

from data_analyser.data_analyser import DataAnalyser
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
            "distance": float(round(self.analyses["overall.distance"].sum(), 2)),
            "duration": {
                "overall": int(self.analyses["overall.duration.overall"].sum()),
                "engineOn": int(self.analyses["overall.duration.engineOn"].sum()),
                "engineOff": int(self.analyses["overall.duration.engineOff"].sum()),
                "idle": int(self.analyses["overall.duration.idle"].sum()),
                "driving": int(self.analyses["overall.duration.driving"].sum()),
            },
        }

    def _calculate_driving(self):
        acceleration_avg = self._weighted_average(
            self.analyses["driving.acceleration.avg"],
            self.analyses["overall.duration.driving"],
        )
        acceleration_avg = int(round(acceleration_avg)) if acceleration_avg else None
        fuel_consumption_avg = self._weighted_average(
            self.analyses["driving.fuelConsumption.per_100km"],
            self.analyses["overall.distance"],
        )
        fuel_consumption_avg = (
            float(round(fuel_consumption_avg, 2)) if fuel_consumption_avg else None
        )
        revs_avg = self._weighted_average(
            self.analyses["driving.revs.avg"],
            self.analyses["overall.duration.driving"],
        )
        revs_avg = int(round(revs_avg)) if revs_avg else None
        revs_driving_avg = self._weighted_average(
            self.analyses["driving.revs.avgDriving"],
            self.analyses["overall.duration.driving"],
        )
        revs_driving_avg = int(round(revs_driving_avg)) if revs_driving_avg else None
        speed_avg = self._weighted_average(
            self.analyses["driving.speed.avg"],
            self.analyses["overall.duration.driving"],
        )
        speed_avg = float(round(speed_avg, 2)) if speed_avg else None

        return {
            "acceleration": {
                "max": float(self.analyses["driving.acceleration.max"].max()),
                "avg": acceleration_avg,
            },
            "fuelConsumption": {
                "total": float(
                    round(self.analyses["driving.fuelConsumption.liters"].sum(), 2)
                ),
                "avg": fuel_consumption_avg,
            },
            "revs": {
                "min": int(self.analyses["driving.revs.min"].min()),
                "max": int(self.analyses["driving.revs.max"].max()),
                "avg": revs_avg,
                "avgDriving": revs_driving_avg,
            },
            "speed": {
                "avg": speed_avg,
                "max": float(self.analyses["driving.speed.max"].max()),
            },
        }

    def _calculate_engine(self):
        battery_before_drive_avg = self.analyses[
            "engine.battery.beforeDrive.avg"
        ].mean()
        battery_before_drive_avg = float(round(battery_before_drive_avg, 2))
        engineRunning_avg = self._weighted_average(
            self.analyses["engine.battery.engineRunning.avg"],
            self.analyses["overall.duration.engineOn"],
        )
        engineRunning_avg = (
            float(round(engineRunning_avg, 2)) if engineRunning_avg else None
        )
        coolantTemp_avg = self._weighted_average(
            self.analyses["engine.coolantTemp.avg"],
            self.analyses["overall.duration.engineOn"],
        )
        coolantTemp_avg = float(round(coolantTemp_avg, 2)) if coolantTemp_avg else None
        oilTemp_avg = self._weighted_average(
            self.analyses["engine.oilTemp.avg"],
            self.analyses["overall.duration.engineOn"],
        )
        oilTemp_avg = float(round(oilTemp_avg, 2)) if oilTemp_avg else None

        return {
            "battery": {
                "beforeDrive": {"avg": battery_before_drive_avg},
                "engineRunning": {"avg": engineRunning_avg},
            },
            "coolantTemp": {
                "min": float(self.analyses["engine.coolantTemp.min"].min()),
                "max": float(self.analyses["engine.coolantTemp.max"].max()),
                "avg": coolantTemp_avg,
            },
            "engineWarmup": {
                "coolant": float(self.analyses["engine.engineWarmup.coolant"].mean()),
                "oil": float(self.analyses["engine.engineWarmup.oil"].mean()),
            },
            "errors": {
                "min": int(self.analyses["engine.errors"].min()),
                "max": int(self.analyses["engine.errors"].max()),
            },
            "oilCarbonate": {
                "min": int(self.analyses["engine.oilCarbonate"].min())
                if not self.analyses["engine.oilCarbonate"].isnull().all()
                else None,
                "max": int(self.analyses["engine.oilCarbonate"].max())
                if not self.analyses["engine.oilCarbonate"].isnull().all()
                else None,
            },
            "oilDilution": {
                "min": int(self.analyses["engine.oilDilution"].min())
                if not self.analyses["engine.oilDilution"].isnull().all()
                else None,
                "max": int(self.analyses["engine.oilDilution"].max())
                if not self.analyses["engine.oilDilution"].isnull().all()
                else None,
            },
            "oilTemp": {
                "min": int(self.analyses["engine.oilTemp.min"].min())
                if not self.analyses["engine.oilTemp.min"].isnull().all()
                else None,
                "max": int(self.analyses["engine.oilTemp.max"].max())
                if not self.analyses["engine.oilTemp.max"].isnull().all()
                else None,
                "avg": oilTemp_avg,
            },
        }

    def _calculate_fap(self):
        pressure_avg = self._weighted_average(
            self.analyses["fap.pressure.avg"],
            self.analyses["overall.duration.engineOn"],
        )
        pressure_avg = float(round(pressure_avg, 2)) if pressure_avg else None
        pressure_idle_avg = self._weighted_average(
            self.analyses["fap.pressure_idle.avg"],
            self.analyses["overall.duration.idle"],
        )
        pressure_idle_avg = (
            float(round(pressure_idle_avg, 2)) if pressure_idle_avg else None
        )
        temp_avg = self._weighted_average(
            self.analyses["fap.temp.avg"],
            self.analyses["overall.duration.engineOn"],
        )
        temp_avg = float(round(temp_avg, 2)) if temp_avg else None

        return {
            "pressure": {
                "min": float(self.analyses["fap.pressure.min"].min()),
                "max": float(self.analyses["fap.pressure.max"].max()),
                "avg": pressure_avg,
            },
            "pressure_idle": {
                "avg": pressure_idle_avg,
            },
            "temp": {
                "min": float(self.analyses["fap.temp.min"].min()),
                "max": float(self.analyses["fap.temp.max"].max()),
                "avg": temp_avg,
            },
        }

    def _calculate_fap_regen(self):
        duration = self.analyses.get("fapRegen.duration")
        if not duration:
            return None

        distance_avg = self._weighted_average(
            self.analyses["fapRegen.distance"], duration
        )
        distance_avg = float(round(distance_avg, 2)) if distance_avg else None
        speed_avg = self._weighted_average(
            self.analyses["fapRegen.speed.avg"], duration
        )
        speed_avg = float(round(speed_avg, 2)) if speed_avg else None
        fap_temp_avg = self._weighted_average(
            self.analyses["fapRegen.fapTemp.avg"], duration
        )
        fap_temp_avg = float(round(fap_temp_avg, 2)) if fap_temp_avg else None
        fap_pressure_avg = self._weighted_average(
            self.analyses["fapRegen.fapPressure.avg"], duration
        )
        fap_pressure_avg = (
            float(round(fap_pressure_avg, 2)) if fap_pressure_avg else None
        )
        revs_avg = self._weighted_average(self.analyses["fapRegen.revs.avg"], duration)
        revs_avg = int(round(revs_avg)) if revs_avg else None
        fap_soot_start_avg = self.analyses["fapRegen.fapSoot.start"].mean()
        fap_soot_start_avg = (
            float(round(fap_soot_start_avg, 2)) if fap_soot_start_avg else None
        )
        fap_soot_end_avg = self.analyses["fapRegen.fapSoot.end"].mean()
        fap_soot_end_avg = (
            float(round(fap_soot_end_avg, 2)) if fap_soot_end_avg else None
        )
        fuel_consumption_regen_avg = self._weighted_average(
            self.analyses["fapRegen.fuelConsumption.regen"], duration
        )
        fuel_consumption_regen_avg = float(round(fuel_consumption_regen_avg, 2))
        fuel_consumption_non_regen_avg = self._weighted_average(
            self.analyses["fapRegen.fuelConsumption.non-regen"], duration
        )
        fuel_consumption_non_regen_avg = float(round(fuel_consumption_non_regen_avg, 2))

        return {
            "previousRegen": int(self.analyses["fapRegen.previousRegen"].mean()),
            "duration": int(duration.mean()),
            "distance": distance_avg,
            "speed": {
                "min": float(self.analyses["fapRegen.speed.min"].min()),
                "max": float(self.analyses["fapRegen.speed.max"].max()),
                "avg": speed_avg,
            },
            "fapTemp": {
                "min": float(self.analyses["fapRegen.fapTemp.min"].min()),
                "max": float(self.analyses["fapRegen.fapTemp.max"].max()),
                "avg": fap_temp_avg,
            },
            "fapPressure": {
                "min": float(self.analyses["fapRegen.fapPressure.min"].min()),
                "max": float(self.analyses["fapRegen.fapPressure.max"].max()),
                "avg": fap_pressure_avg,
            },
            "revs": {
                "min": int(self.analyses["fapRegen.revs.min"].min()),
                "max": int(self.analyses["fapRegen.revs.max"].max()),
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
