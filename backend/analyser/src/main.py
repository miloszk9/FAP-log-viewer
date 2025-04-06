import pandas as pd
from json import dumps
from datetime import timedelta
from overall_parameters import OverallParameters
from driving_parameters import DrivingParameters
from engine_parameters import EngineParameters
from fap_parameters import FapParameters
from fap_regen_parameters import FapRegenParameters


class FapLogAnalyser:
    def __init__(self, file_path):
        # self.csv = pd.read_csv(file_path, delimiter=";", encoding="latin1")
        self._process_data()
        self.result = {
            "Overall": OverallParameters(file_path).result,
            "Driving": DrivingParameters(file_path).result,
            "Engine": EngineParameters(file_path).result,
            "Fap": FapParameters(file_path).result,
            "FapRegen": FapRegenParameters(file_path).result,
        }

    def __str__(self):
        return str(self.to_json())

    def to_json(self):
        return dumps(self.result)

    def _process_data(self):
        """Preprocess the data."""
        pass

    # def analyze(self):
    #     """Run all analyses."""
    #     overall = IdleTimeAnalyser(self.df).calculate_idle_and_driving_time()
    #     fuel = FuelConsumptionAnalyser(self.df).calculate_average_fuel_consumption()
    #     fap = IdleFAPPressureAnalyser(self.df).analyze_idle_fap_pressure()
    #     engine = EngineWarmupAnalyser(self.df).calculate_warmup_time()

    #     results = {
    #         "Overall": overall,
    #         "Fuel Consumption": fuel,
    #         "FAP Pressure": fap,
    #         "Engine Warmup": engine,
    #     }
    #     return results


# Example usage
if __name__ == "__main__":
    fapLogAnalyse = FapLogAnalyser("backend/analyser/data/DCM62v2_20240720.csv")
    print(fapLogAnalyse)
