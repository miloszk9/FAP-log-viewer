# Components

## UI

- simple UI in bootstrap
- communication with Nest backend only with Rest requests
- render and serve in flask - in a separate continer
- could have some simple ajax to check if backend processed data

## BACKEND

### Backend - Nest JS

- Communication:
  - With UI - REST
  - With python analysis backend - NATS - https://NATS.io/
- REST Endpoints:
  - POST /analyse - upload csv file for analysis
    - save incomming .csv file to separate http file server, since:
      - shared volume - requires the apps to be scheduled on the same nodes
    - should perform very basic validation - e.g. if valid .csv file
    - return id of the analysis
      - ideally - sth random, not incremental int
    - should schedule analyse process in python
      - write on NATS
    - save status to the database - without analysis json
  - GET /analyse/id - get analysis of a csv file
    - read from database
    - if processing the data failed or in progress, return proper status
    - if data processed, return processed json 
- Communication with Analyser - NATS
  - Publish to schedule the job
  - Listen, save analisis result json to the database

### Analyser - python

- analyser returns JSON payload
- .csv file should be stored on separate http file server
- python server listening on NATS topic
  - run analysis on the .csv
  - write on NATS

### Database

- postgres
- FapAnalysis table schema
  - id - should have some non-incremental value 
  - stage - upload/analyse
  - status - success/fail/progressing
  - message - if any error occures
  - sha256 - of the .csv file
  - result - json with data payload
