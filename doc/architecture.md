# Components

## Frontend

- simple UI in bootstrap
- communication with Nest backend only with Rest requests
- serve in a separate continer

## Backend

### HTTP Backend - Nest JS

- Communication:
  - With UI - REST
  - With python analysis backend - NATS - https://NATS.io/
- REST Endpoints external:
  - POST /analyse - upload csv file for analysis
    - save incomming .csv file to persistant volume
    - should perform very basic validation - e.g. if valid .csv file
    - return id of the analysis
      - ideally - sth random, not incremental int
    - should schedule analyse process in python
      - publish on NATS analyse.request
    - save status to the database - without analysis json
  - GET /analyse/id - get analysis of a csv file
    - read from database
    - if processing the data failed or in progress, return proper status
    - if data processed, return processed json
  - GET /user_analyse/id - get analysis of a user
    - read from database
    - if processing the data failed or in progress, return proper status
    - if data processed, return processed json
- Communication with Analyser - NATS
  - Publish analyse.request
    - triggered during POST /analyse
  - Listen analyse.response
    - get data sent by analyser
    - save analisis result json to the database
    - trigger NATS Publish user_analyse.request
      - get current user averages from db
      - get new analysis parameters from result
  - Publish user_analyse.request
    - triggered during Listen analyse.response
  - Listen user_analyse.request
    - get data sent by analyser
    - save analisis result json to the database
- Communication with postgres database
  - FapAnalysis table schema
    - id - should have some non-incremental value
    - stage - upload/analyse
    - status - success/fail/progressing
    - message - if any error occures
    - sha256 - of the .csv file
    - result - json with data payload

### Analyser - python

- analyser returns JSON payload with following properties:
  - id: e.g. "d0f8f659-36ec-4552-bc35-033cfb639f06"
  - status: "Success" / "Failed"
  - message: "Failed to read csv file", "Failed to process data", "Analysis completed successfully."
  - analysis: {json with analysis}
- user average parameters
  - should be done in a seperate NATS topic
  - analyser should get the average parameters of the user
  - analyser should get the new file analysis
  - should return updated average parameters
- .csv file should be stored in persistent shared volume
  - future enhancement: store outside of backend continers - e.g. http file server
- python server listening on NATS topic
  - run analysis on the .csv
  - write on NATS

### Database

- postgres

### Data format

#### Single analysis

Example:

```json
{
  "date": {
    "date": "2025-03-11",
    "start": "07:32:34",
    "end": "08:21:49"
  },
  "overall": {
    "distance_km": 18.91,
    "duration": {
      "overall_sec": 2376,
      "engineOff_sec": 170,
      "engineOn_sec": 2206,
      "idle_sec": 589,
      "driving_sec": 1616
    },
    "externalTemp": {
      "avg_c": 10.5,
      "max_c": 12,
      "min_c": 10
    }
  },
  "driving": {
    "acceleration": {
      "max_perc": 39,
      "avg_perc": 18.89
    },
    "fuelConsumption": {
      "total_l": 2.25,
      "avg_l100km": 11.9
    },
    "revs": {
      "min": 0,
      "max": 2906,
      "avg": 1457,
      "avgDriving": 1679
    },
    "speed": {
      "avg_kmh": 23.2,
      "max_kmh": 74,
      "min_kmh": 0
    }
  },
  "engine": {
    "battery": {
      "beforeDrive": {
        "min_v": 12.3,
        "max_v": 12.3,
        "avg_v": 12.3
      },
      "engineRunning": {
        "min_v": 12.3,
        "max_v": 14.58,
        "avg_v": 14.45
      }
    },
    "coolantTemp": {
      "min_c": 11,
      "max_c": 97,
      "avg_c": 76
    },
    "engineWarmup": {
      "coolant_sec": 20.37,
      "oil_sec": 23.73
    },
    "errors": 0,
    "oilCarbonate_perc": 1,
    "oilDilution_perc": 3,
    "oilTemp": {
      "min_c": 12,
      "max_c": 100,
      "avg_c": 76
    }
  },
  "fap": {
    "additive": {
      "vol_ml": 1260,
      "remain_ml": 752
    },
    "deposits": {
      "percentage_perc": 3,
      "weight_gram": 2
    },
    "lastRegen_km": 3,
    "last10Regen_km": 751,
    "life": {
      "life_km": 11469,
      "left_km": 142560
    },
    "pressure_idle": {
      "avg_mbar": 10.1,
      "max_mbar": 37,
      "min_mbar": 0
    },
    "pressure": {
      "min_mbar": 0,
      "max_mbar": 133,
      "avg_mbar": 29.2
    },
    "soot": {
      "start_gl": 17.5,
      "end_gl": 0.74,
      "diff_gl": -16.76
    },
    "temp": {
      "min_c": 7,
      "max_c": 440,
      "avg_c": 225
    }
  },
  "fapRegen": {
    "previousRegen_km": 868,
    "duration_sec": 905,
    "distance_km": 8.5,
    "speed": {
      "min_kmh": 0,
      "max_kmh": 70,
      "avg_kmh": 33.7
    },
    "fapTemp": {
      "min_c": 225,
      "max_c": 440,
      "avg_c": 341.21
    },
    "fapPressure": {
      "min_mbar": 11,
      "max_mbar": 133,
      "avg_mbar": 44.75
    },
    "revs": {
      "min": 756,
      "max": 2906,
      "avg": 1943.92
    },
    "fapSoot": {
      "start_gl": 17.66,
      "end_gl": 1.77,
      "diff_gl": -15.89
    },
    "fuelConsumption": {
      "regen_l100km": 17.64,
      "nonRegen_l100km": 9.47
    }
  }
}
```

#### User analysis

Example:

```json
{
  "overall": {
    "distance_km": 18.91, // total
    "duration": {
      "overall_sec": 2376, // total
      "engineOff_sec": 170, // total
      "engineOn_sec": 2206, // total
      "idle_sec": 589, // total
      "driving_sec": 1616 // total
    }
  },
  "driving": {
    "acceleration": {
      "max_perc": 39,
      "avg_perc": 18.89 // weighted average (overall.duration.driving)
    },
    "fuelConsumption_l100km": 12.48, // weighted average (overall.distance)
    "revs": {
      "min": 0,
      "max": 2906,
      "avg": 1457, // weighted average (overall.duration.engineOn)
      "avgDriving": 1679 // weighted average (overall.duration.driving)
    },
    "speed": {
      "avg_kmh": 23.2, // weighted average (overall.duration.engineOn)
      "max_kmh": 74
    }
  },
  "engine": {
    "battery": {
      "beforeDrive": {
        "avg_v": 12.3 // simple average
      },
      "engineRunning": {
        "avg_v": 14.45 // weighted average (overall.duration.engineOn)
      }
    },
    "coolantTemp": {
      "min_c": 11,
      "max_c": 97,
      "avg_c": 76 // weighted average (overall.duration.engineOn)
    },
    "engineWarmup": {
      "coolant_sec": 20.37, // simple average
      "oil_sec": 23.73 // simple average
    },
    "errors": {
      "min": 0,
      "max": 2
    },
    "oilCarbonate": {
      "min_perc": 0,
      "max_perc": 3
    },
    "oilDilution": {
      "min_perc": 0,
      "max_perc": 2
    },
    "oilTemp": {
      "min_c": 12,
      "max_c": 100,
      "avg_c": 76 // weighted average (overall.duration.engineOn)
    }
  },
  "fap": {
    "pressure": {
      "min_mbar": 0,
      "max_mbar": 100,
      "avg_mbar": 10.1 // weighted average (overall.duration.engineOn)
    },
    "pressure_idle": {
      "avg_mbar": 10.1 // weighted average (overall.duration.idle)
    },
    "soot": {
      "min_gl": 0.74,
      "max_gl": 17.5
    },
    "temp": {
      "min_c": 7,
      "max_c": 440,
      "avg_c": 224 // weighted average (overall.duration.engineOn)
    }
  },
  "fapRegen": {
    "previousRegen_km": 868, // simple average
    "duration_sec": 905, // simple average
    "distance_km": 8.5, // weighted average (fapRegen.duration)
    "speed": {
      "min_kmh": 0,
      "max_kmh": 70,
      "avg_kmh": 33.7 // weighted average (fapRegen.duration)
    },
    "fapTemp": {
      "min_c": 225,
      "max_c": 440,
      "avg_c": 341.21 // weighted average (fapRegen.duration)
    },
    "fapPressure": {
      "min_mbar": 11,
      "max_mbar": 133,
      "avg_mbar": 44.75 // weighted average (fapRegen.duration)
    },
    "revs": {
      "min": 756,
      "max": 2906,
      "avg": 1943.92 // weighted average (fapRegen.duration)
    },
    "fapSoot": {
      "start_gl": 17.66, // simple average
      "end_gl": 1.77 // simple average
    },
    "fuelConsumption": {
      "regen_l100km": 17.64, // weighted average (fapRegen.duration)
      "nonRegen_l100km": 9.47 // weighted average (fapRegen.duration)
    }
  }
}
```

### Nats messages format

#### analyse.request

```json
{
  "id": "File_id"
}
```

#### analyse.result

```json
{
  "id": "490234c9-9b67-46b2-9141-98b2d9d177d1",
  "fileName": "DCM62v2_20250328.csv",
  "status": "Success",
  "message": "Analysis completed successfully.",
  "result": {}
}
```

#### average.request

```json
{
  "id": "User_id",
  "analysis_sha": "sha256", // Will know what data was calculated, also backend will know if it needs to trigger new average analysis
  "analysis": [{}, {}] // Could also be gzip'ed data
}
```

#### average.result

```json
{
  "id": "User_id",
  "analysis_sha": "sha256",
  "status": "Success",
  "message": "Analysis completed successfully.",
  "average": {}
}
```
