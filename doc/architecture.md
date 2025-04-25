# Components

## UI

- simple UI in bootstrap
- communication with Nest backend only with Rest requests
- render and serve in flask - in a separate continer
- could have some simple ajax to check if backend processed data

## BACKEND

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
      - write on NATS
    - save status to the database - without analysis json
  - GET /analyse/id - get analysis of a csv file
    - read from database
    - if processing the data failed or in progress, return proper status
    - if data processed, return processed json
- Communication with Analyser - NATS
  - Publish to schedule the job
  - Listen, save analisis result json to the database
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
- .csv file should be stored in persistent shared volume
  - future enhancement: store outside of backend continers - e.g. http file server
- python server listening on NATS topic
  - run analysis on the .csv
  - write on NATS

### Database

- postgres

## DevOps

### K3s deployment

#### Tools

- ArgoCD
- Sealed Secrets
- OpenTelemetry
- Grafana Cloud free

### (optional) Backup

- Run on a different node as the application
  - use cron jobs to schedule backup action
  - e.g. every 24h
  - provide a way of restoring the data on a new node
  - this way, no replicated storage or a NFS is needed
  - ideally, do it for postgres and .csv storage
