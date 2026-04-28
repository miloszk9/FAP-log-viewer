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
