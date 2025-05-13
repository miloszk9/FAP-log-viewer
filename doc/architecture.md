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
    "distance": 18.91,
    "duration": {
      "overall": 2376,
      "engineOff": 170,
      "engineOn": 2206,
      "idle": 589,
      "driving": 1616
    },
    "externalTemp": {
      "avg": 10.5,
      "max": 12,
      "min": 10
    }
  },
  "driving": {
    "acceleration": {
      "max": 39,
      "avg": 18.89
    },
    "fuelConsumption": {
      "liters": 2.25,
      "per_100km": 11.9
    },
    "revs": {
      "min": 0,
      "max": 2906,
      "avg": 1457,
      "avgDriving": 1679
    },
    "speed": {
      "avg": 23.2,
      "max": 74,
      "min": 0
    }
  },
  "engine": {
    "battery": {
      "beforeDrive": {
        "min": 12.3,
        "max": 12.3,
        "avg": 12.3
      },
      "engineRunning": {
        "min": 12.3,
        "max": 14.58,
        "avg": 14.45
      }
    },
    "coolantTemp": {
      "min": 11,
      "max": 97,
      "avg": 76
    },
    "engineWarmup": {
      "coolant": 20.37,
      "oil": 23.73
    },
    "errors": 0,
    "oilCarbonate": 1,
    "oilDilution": 3,
    "oilTemp": {
      "min": 12,
      "max": 100,
      "avg": 76
    }
  },
  "fap": {
    "additive": {
      "vol": 1260,
      "remain": 752
    },
    "deposits": {
      "percentage": 3,
      "weight_gram": 2
    },
    "lastRegen": 3,
    "lastRegen10": 751,
    "life": {
      "life_avg": 11469,
      "left_avg": 142560
    },
    "pressure_idle": {
      "avg": 10.1,
      "max": 37,
      "min": 0
    },
    "pressure": {
      "min": 0,
      "max": 133,
      "avg": 29.2
    },
    "soot": {
      "start": 17.5,
      "end": 0.74,
      "diff": -16.76
    },
    "temp": {
      "min": 7,
      "max": 440,
      "avg": 225
    }
  },
  "fapRegen": {
    "previousRegen": 868,
    "duration": 905,
    "distance": 8.5,
    "speed": {
      "min": 0,
      "max": 70,
      "avg": 33.7
    },
    "fapTemp": {
      "min": 225,
      "max": 440,
      "avg": 341.21
    },
    "fapPressure": {
      "min": 11,
      "max": 133,
      "avg": 44.75
    },
    "revs": {
      "min": 756,
      "max": 2906,
      "avg": 1943.92
    },
    "fapSoot": {
      "start": 17.66,
      "end": 1.77,
      "diff": -15.89
    },
    "fuelConsumption": {
      "regen": 17.64,
      "non-regen": 9.47
    }
  }
}
```

#### User analysis

Example:

```json
{
  "overall": {
    "distance": 18.91, // total
    "duration": {
      "overall": 2376, // total
      "engineOff": 170, // total
      "engineOn": 2206, // total
      "idle": 589, // total
      "driving": 1616 // total
    }
  },
  "driving": {
    "acceleration": {
      "max": 39,
      "avg": 18.89 // weighted average (overall.duration.driving)
    },
    "fuelConsumption": 12.48, // weighted average (overall.distance)
    "revs": {
      "min": 0,
      "max": 2906,
      "avg": 1457, // weighted average (overall.duration.engineOn)
      "avgDriving": 1679 // weighted average (overall.duration.driving)
    },
    "speed": {
      "avg": 23.2, // weighted average (overall.duration.engineOn)
      "max": 74,
    }
  },
  "engine": {
    "battery": {
      "beforeDrive": {
        "avg": 12.3 // simple average
      },
      "engineRunning": {
        "avg": 14.45 // weighted average (overall.duration.engineOn)
      }
    },
    "coolantTemp": {
      "min": 11,
      "max": 97,
      "avg": 76 // weighted average (overall.duration.engineOn)
    },
    "engineWarmup": {
      "coolant": 20.37, // simple average
      "oil": 23.73 // simple average
    },
    "errors": {
      "min": 0,
      "max": 2
    },
    "oilCarbonate": {
      "min": 0,
      "max": 3
    },
    "oilDilution": {
      "min": 0,
      "max": 2
    },
    "oilTemp": {
      "min": 12,
      "max": 100,
      "avg": 76 // weighted average (overall.duration.engineOn)
    }
  },
  "fap": {
    "pressure": {
      "min": 0,
      "max": 100,
      "avg": 10.1, // weighted average (overall.duration.engineOn)
    },
    "pressure_idle": {
      "avg": 10.1, // weighted average (overall.duration.idle)
    },
    "soot": {
      "min": 0.74,
      "max": 17.5,
    },
    "temp": {
      "min": 7,
      "max": 440,
      "avg": 224 // weighted average (overall.duration.engineOn)
    }
  },
  "fapRegen": {
    "previousRegen": 868, // simple average
    "duration": 905, // simple average
    "distance": 8.5, // weighted average (fapRegen.duration)
    "speed": {
      "min": 0,
      "max": 70,
      "avg": 33.7 // weighted average (fapRegen.duration)
    },
    "fapTemp": {
      "min": 225,
      "max": 440,
      "avg": 341.21 // weighted average (fapRegen.duration)
    },
    "fapPressure": {
      "min": 11,
      "max": 133,
      "avg": 44.75 // weighted average (fapRegen.duration)
    },
    "revs": {
      "min": 756,
      "max": 2906,
      "avg": 1943.92 // weighted average (fapRegen.duration)
    },
    "fapSoot": {
      "start": 17.66, // simple average
      "end": 1.77, // simple average
    },
    "fuelConsumption": {
      "regen": 17.64, // weighted average (fapRegen.duration)
      "non-regen": 9.47 // weighted average (fapRegen.duration)
    }
  }
}
```


### Nats messages format

#### analyse.request

```json
{
  "id": "File_id",
}
```

#### analyse.result

```json
{
  "id": "File_id",
  "status": "Success",
  "message": "Analysis completed successfully.",
  "analysis": {},
}
```

#### average.request

```json
{
  "id": "User_id",
  "analysis_sha": "sha256", // Will know what data was calculated, also backend will know if it needs to trigger new average analysis
  "analysis": [{}, {}], // Could also be gzip'ed data
}
```

#### average.result

```json
{
  "id": "User_id",
  "analysis_sha": "sha256",
  "status": "Success",
  "message": "Analysis completed successfully.",
  "average": {},
}
```
