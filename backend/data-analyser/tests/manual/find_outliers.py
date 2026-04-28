import os
from data_analyser.data_analyser import DataAnalyser
from logger_setup import setup_logger

logger = setup_logger(__name__)

def find_outliers():
    # Ensure STORAGE_PATH is set in environment or handled by DataAnalyser
    data_dir = "../data/ds4/"
    if not os.path.exists(data_dir):
        print(f"Directory {data_dir} not found. Make sure you are in backend/data-analyser/src")
        return

    csv_files = [
        os.path.splitext(f)[0] for f in os.listdir(data_dir) if f.endswith(".csv")
    ]
    
    outliers = []
    
    print(f"Scanning {len(csv_files)} files for outliers...")
    for file_name in csv_files:
        try:
            analysis = DataAnalyser(file_name).result
            
            file_outliers = []
            
            # Check injector4
            inj4 = analysis.get('engine', {}).get('injector', {}).get('injector4')
            if inj4 is not None and inj4 > 4.0:
                file_outliers.append(f"injector4: {inj4}")
                
            # Check fap max pressure
            max_p = analysis.get('fap', {}).get('pressure', {}).get('max_mbar')
            if max_p is not None and max_p > 1000:
                file_outliers.append(f"max_mbar: {max_p}")
                
            # Check fap max temp
            max_t = analysis.get('fap', {}).get('temp', {}).get('max_c')
            if max_t is not None and max_t > 1000:
                file_outliers.append(f"max_c: {max_t}")
            
            if file_outliers:
                print(f"FILE: {file_name} -> {', '.join(file_outliers)}")
                outliers.append(file_name)
                
        except Exception as e:
            # Silent error for files that might be corrupted or missing columns
            pass

    if not outliers:
        print("No outliers found with current thresholds.")
    else:
        print(f"\nFound {len(set(outliers))} unique files with outliers.")

if __name__ == "__main__":
    find_outliers()
