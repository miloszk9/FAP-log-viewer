from json import dumps

import pandas as pd


class DateParameters:
    def __init__(self, csv):
        self.csv = csv
        self.result = {
            "date": self._calculate_date(),
            "start": self._calculate_start(),
            "end": self._calculate_end(),
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _calculate_date(self):
        """Return the earliest date from the dataset."""
        if "Datetime" not in self.csv.columns or self.csv["Datetime"].dropna().empty:
            return None

        min_date = self.csv["Datetime"].min()
        return min_date.strftime("%Y-%m-%d") if not pd.isna(min_date) else None

    def _calculate_start(self):
        """Calculate average and max speed."""
        if "Datetime" not in self.csv.columns or self.csv["Datetime"].dropna().empty:
            return None

        min_date = self.csv["Datetime"].min()
        return min_date.strftime("%H:%M:%S") if not pd.isna(min_date) else None

    def _calculate_end(self):
        """Calculate average and max speed."""
        if "Datetime" not in self.csv.columns or self.csv["Datetime"].dropna().empty:
            return None

        max_date = self.csv["Datetime"].max()
        return max_date.strftime("%H:%M:%S") if not pd.isna(max_date) else None


if __name__ == "__main__":
    # Run from "backend/data-analyser/src"
    # Usage: python -m data_analyser.parameters.date_parameters
    file_path = "../data/ds4/DCM62v2_20250222.csv"
    csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")

    csv["Datetime"] = pd.to_datetime(csv["Date"] + " " + csv["Time"], errors="coerce")
    csv = csv.sort_values("Datetime")

    date_parameters = ["Datetime"]
    filtered_csv = csv[date_parameters].copy()

    dateParameters = DateParameters(filtered_csv)
    print(dateParameters)
