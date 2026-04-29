import os
import sys

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

# Set default storage path if not set
if "STORAGE_PATH" not in os.environ:
    os.environ["STORAGE_PATH"] = "../data/ds4"

import pandas as pd
from data_analyser.data_analyser import DataAnalyser

def check_missing_data():
    data_dir = "../data/ds4/"
    csv_files = [
        os.path.splitext(f)[0] for f in os.listdir(data_dir) if f.endswith(".csv")
    ]

    total_logs = len(csv_files)
    logs_with_idle = 0
    logs_with_injectors = 0
    total_idle_sec = 0
    idle_sec_without_injectors = 0

    # print(f"Checking {total_logs} files...")

    for file_name in csv_files:
        try:
            analysis = DataAnalyser(file_name).result
            idle_sec = analysis.get("overall", {}).get("duration", {}).get("idle_sec", 0)
            if idle_sec > 0:
                logs_with_idle += 1
                total_idle_sec += idle_sec
                
                inj = analysis.get("engine", {}).get("injector", {}).get("injector1")
                if inj is not None:
                    logs_with_injectors += 1
                else:
                    idle_sec_without_injectors += idle_sec
        except Exception as e:
            pass

    print(f"\nSummary:")
    print(f"Total logs processed: {total_logs}")
    print(f"Logs with idle time > 0: {logs_with_idle}")
    print(f"Logs with injector data: {logs_with_injectors}")
    print(f"Total idle seconds: {total_idle_sec}")
    print(f"Idle seconds without injector data: {idle_sec_without_injectors}")
    
    if total_idle_sec > 0:
        error_ratio = idle_sec_without_injectors / total_idle_sec
        print(f"Weight error ratio: {error_ratio:.2%}")

if __name__ == "__main__":
    check_missing_data()
