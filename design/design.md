# Single log analysis

## Data

### Overall

- Date
  - date
- Speed
  - avg
  - max
- Distance
  - XX km
- External Temperature
  - min
  - max
  - avg

Calculate:
- Duration
  - hh:mm:ss
- Idle time, driving time (depending on revs & speed)
  - hh:mm:ss

### Driving

- rev (max, average - while driving, overall)
  - min
  - max
  - avg - overall
  - avg - while driving
- speed
  - min
  - max
  - avg
- acceleration pedal position (excluding 0)
  - max
  - avg
- fuel consumption
  - avg

### Engine parameters

- Coolant temp
  - min
  - max
  - avg
- Oil temp
  - min
  - max
  - avg
- Oil dilution, carbonate
  - avg
- Acu voltage
  - Engine shut off
    - min
    - max
    - avg
  - Engine running
    - min
    - max
    - avg
- Errors
  - max

Calculate:
- Engine warmup time (if initial coolant and oil was < 50)
  - Coolant warmup time
  - Oil warmup time

### FAP

- FAP regen last 10
  - avg
- FAP deposits, cinder
  - avg
- FAP addative values
  - avg
- Fap pressure
  - min
  - max
  - avg
- FAPSoot - min, max, diff
  - start
  - end
  - diff (start - end)
- Last Regen
  - end
- FAP Life, Life left
  - avg
  - avg

Calculate:
- Idle FAP pressure
  - min
  - max
  - avg

### FAP Regen

- Do the calculations only when the REGEN hapened (REGEN=1)
- Regen duration
  - mm:ss
- Distance traveled
  - km
- Speed
  - min
  - max
  - avg
- FAPtemp
  - min
  - max
  - avg
- Fap pressure
  - min
  - max
  - avg
- rev
  - min
  - max
  - avg
- Fuel consumption
  - l/100km (calculate seperately when regen was on and off)

## How to structure the code (python PoC)

Take a deep breath. Provide python application that will analyse logs from FAP application that gets data from a car. Use added files as a reference points of data analysis implementation.
Follow python coding best practicies.
Main class should be FapLogAnalyzer, which reads the csv file and runs underlying classes to trigger data analysis:
  - OverallParameters class - which should cover the aspects in the "### Overall" section
  - DrivingParameters class - which should cover the aspects in the "### Driving" section
  - EngineParameters class - which should cover the aspects in the "### Engine parameters" section
  - FapParameters class - which should cover the aspects in the "### FAP" section
  - FapRegenParameters class - which should cover the aspects in the "### FAP Regen" section
- Do not want to have plots, only data analysis for now

### Plot

- fuel consumption vs speed
- fuel consumption vs rev
