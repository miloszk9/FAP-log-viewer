import sys
import json
from data_analyser.data_analyser import DataAnalyser
from logger_setup import setup_logger

logger = setup_logger(__name__)

def inspect_file(file_name):
    print(f"Inspecting file: {file_name}")
    try:
        analysis = DataAnalyser(file_name).result
        
        # Extract suspicious values
        inj4 = analysis.get('engine', {}).get('injector', {}).get('injector4')
        max_p = analysis.get('fap', {}).get('pressure', {}).get('max_mbar')
        max_t = analysis.get('fap', {}).get('temp', {}).get('max_c')
        
        print(f"\nSummary for {file_name}:")
        print(f"  Injector 4: {inj4}")
        print(f"  FAP Max Pressure: {max_p} mbar")
        print(f"  FAP Max Temp: {max_t} °C")
        
        print("\n--- Engine Analysis Details ---")
        print(json.dumps(analysis.get('engine', {}), indent=2))
        
        print("\n--- FAP Analysis Details ---")
        print(json.dumps(analysis.get('fap', {}), indent=2))
        
        print("\n--- Overall Duration Details ---")
        print(json.dumps(analysis.get('overall', {}).get('duration', {}), indent=2))

    except Exception as e:
        print(f"Error processing {file_name}: {e}")

if __name__ == "__main__":
    target = "DCM62v2_20251003"
    if len(sys.argv) > 1:
        target = sys.argv[1]
    
    inspect_file(target)
