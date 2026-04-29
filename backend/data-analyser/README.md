# FAP Data Analyser

## Running Analysis Manually

All commands should be run from the `backend/data-analyser/src` directory to ensure proper module resolution.

### Single Log Analysis
To test or run analysis on files in the `STORAGE_PATH`:
```bash
export STORAGE_PATH=../data/ds4; source ~/venv/fap/bin/activate && python3 -m data_analyser.data_analyser
```

### Average Calculation
To calculate weighted averages across all logs in the `STORAGE_PATH`:
```bash
export STORAGE_PATH=../data/ds4; source ~/venv/fap/bin/activate && python3 -m data_analyser.data_average
```

## Debugging & Scratch Scripts

Additional scripts for debugging are located in the `scratch/` directory. Run these from the `src` directory:

- **Scan for outliers**: `python3 ../scratch/find_outliers.py`
- **Inspect specific file**: `python3 ../scratch/inspect_file.py <file_id>`
- **Check missing data**: `python3 ../scratch/check_missing_data.py`
- **Verify WA fix**: `python3 ../scratch/repro_wa_bug.py`