# Single log analysis

## Data

### Overall - speed, distance, time

- Date
  - start
  - end
- Duration
  - hh:mm:ss
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
- Engine warmup time

### FAP

- FAP regen last 10
  - avg
- FAP deposits, cinder
  - avg
- FAP addative values
  - avg
- Fap pressure - min, max, avg
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

- 
### Plot

- fuel consumption vs speed
- fuel consumption vs rev
