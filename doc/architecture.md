# Components

## UI

- simple UI in bootstrap
- communication with Nest backend only with Rest requests
- serve with nginx - separately to the Nest / python backend

## BACKEND

### Backend - Nest JS
- Communication:
  - Rest endpoints
- REST Endpoints:
  - POST /log - upload csv file
    - get id in return
    - should schedule analyse in python
    - save status in database
  - GET /log/id - get status of csv file
- Communication with Analyser - Nats
  - Publish to schedule the job
  - Listen, save status / response to the database

### Analyser - python

- analyser returns JSON payload
- share volume with the .csv files with Nest backend
- python server listening on Nats topic
  - run analysis on the .csv 

### Database

- postgres
- FapAnalysis table schema
  - id
  - sha256 of the processed log
  - json with data payload