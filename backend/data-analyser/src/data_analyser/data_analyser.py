from json import dumps

import pandas as pd
from config import STORAGE_PATH
from logger_setup import setup_logger

from data_analyser.constants.csv_columns import (
    driving_parameters,
    engine_parameters,
    fap_parameters,
    fap_regen_parameters,
    overall_parameters,
)
from data_analyser.exceptions.exceptions import DataAnalyseException
from data_analyser.parameters.driving_parameters import DrivingParameters
from data_analyser.parameters.engine_parameters import EngineParameters
from data_analyser.parameters.fap_parameters import FapParameters
from data_analyser.parameters.fap_regen_parameters import FapRegenParameters
from data_analyser.parameters.overall_parameters import OverallParameters

# Set up logger for this module
logger = setup_logger(__name__)


class DataAnalyser:
    def __init__(self, file_id):
        file_path = f"{STORAGE_PATH}/{file_id}.csv"
        self.all_columns = set(
            driving_parameters
            + engine_parameters
            + fap_parameters
            + fap_regen_parameters
            + overall_parameters
        )
        try:
            self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
            logger.info(f"Successfully read log file: {file_path}")
        except Exception as e:
            logger.error(
                f"Failed to read log file {file_path}: {str(e)}", exc_info=True
            )
            raise DataAnalyseException("Failed to read log file.")

        try:
            self._process_data()
            logger.info(f"Successfully processed log file: {file_path}")
        except Exception as e:
            logger.error(
                f"Failed to process log file {file_path}: {str(e)}", exc_info=True
            )
            raise DataAnalyseException("Failed to process log file.")

        try:
            self._split_csv_on_time_gap()
            logger.info(f"Successfully split log file: {file_path}")
        except Exception as e:
            logger.error(
                f"Failed to split log file {file_path}: {str(e)}", exc_info=True
            )
            raise DataAnalyseException("Failed to split log file.")

        try:
            self.result = self._analyse_parameters()
            logger.info(f"Successfully analysed log file: {file_path}")
        except Exception as e:
            logger.error(
                f"Failed to analyse log file {file_path}: {str(e)}", exc_info=True
            )
            raise DataAnalyseException("Failed to analyse log file.")

        self.result = self._analyse_parameters()

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _process_data(self):
        """Preprocess the data."""
        numeric_columns = list(set(self.all_columns) - {"Datetime", "Time_Diff"})
        for col in numeric_columns:
            if col in self.csv.columns:
                self.csv[col] = pd.to_numeric(self.csv[col], errors="coerce")

        # Drop rows with unrealistic values of FAPpressure or FAPtemp
        if "FAPpressure" in self.csv.columns:
            self.csv = self.csv[self.csv.get("FAPpressure") != 65280.0]
        if "FAPtemp" in self.csv.columns:
            self.csv = self.csv[self.csv.get("FAPtemp") != 25855.0]

        self.csv["Datetime"] = pd.to_datetime(
            self.csv["Date"] + " " + self.csv["Time"], errors="coerce"
        )

        # Drop rows where Datetime is NaT (invalid datetime)
        self.csv = self.csv.dropna(subset=["Datetime"])

        self.csv = self.csv.sort_values("Datetime")
        self.csv["Time_Diff"] = self.csv["Datetime"].diff().dt.total_seconds().fillna(0)

    def _split_csv_on_time_gap(self):
        # Calculate typical time difference (median of all time differences)
        # Use a threshold that's 3 times the typical difference
        typical_diff = self.csv["Time_Diff"].median()
        threshold = typical_diff * 3

        # Find split indices
        split_indices = self.csv.index[self.csv["Time_Diff"] > threshold].tolist()
        split_indices = [0] + split_indices

        # Initialize list to store segments
        self.csv_list = []

        # Slice and store in memory
        for i in range(len(split_indices)):
            start = split_indices[i]
            end = (
                split_indices[i + 1] - 1
                if i < len(split_indices) - 1
                else len(self.csv)
            )
            segment = self.csv.iloc[start:end].copy()
            if len(segment) >= 5:
                self.csv_list.append(segment)
                logger.info(f"Stored segment {i + 1} in memory ({len(segment)} rows)")
            else:
                logger.info(
                    f"Skipped segment {i + 1} - too short ({len(segment)} rows)"
                )

    def _analyse_parameters(self):
        """Analyze parameters for each segment and combine results."""
        results = []

        for i, segment in enumerate(self.csv_list):
            logger.info(f"Analyzing segment {i + 1}")
            csv_columns = segment.columns
            overall_columns = list(set(csv_columns) & set(overall_parameters))
            driving_columns = list(set(csv_columns) & set(driving_parameters))
            engine_columns = list(set(csv_columns) & set(engine_parameters))
            fap_columns = list(set(csv_columns) & set(fap_parameters))
            fap_regen_columns = list(set(csv_columns) & set(fap_regen_parameters))

            segment_result = {
                "segment": i + 1,
                "overall": OverallParameters(segment[overall_columns].copy()).result,
                "driving": DrivingParameters(segment[driving_columns].copy()).result,
                "engine": EngineParameters(segment[engine_columns].copy()).result,
                "fap": FapParameters(segment[fap_columns].copy()).result,
                "fapRegen": FapRegenParameters(
                    segment[fap_regen_columns].copy()
                ).result,
            }
            results.append(segment_result)

        return {"segments": results, "total_segments": len(results)}


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # export STORAGE_PATH=../data/ds4
    # Usage: python -m data_analyser.data_analyser
    import os
    from time import time

    data_dir = "../data/ds4/"
    csv_files = [
        os.path.splitext(f)[0] for f in os.listdir(data_dir) if f.endswith(".csv")
    ]

    for file_name in csv_files:
        logger.info(f"Processing file: {file_name}")
        # file_path = "backend/analyser/data/peugeot/HDI_SID807_BR2_20240116.csv"
        start = time()
        fapLogAnalyse = DataAnalyser(file_name)
        end = time()
        # logger.debug(f"Processing time: {end - start} seconds")
        logger.info(f"Analysis result: {fapLogAnalyse}")

    # Test with a specific file
    fapLogAnalyse = DataAnalyser("DCM62v2_20250222")
    logger.info(f"Analysis result: {fapLogAnalyse}")
