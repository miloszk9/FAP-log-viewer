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
- acceleration pedal position
  - max
  - avg (excluding 0)
- fuel consumption
  - avg

### Engine parameters

- Coolant temp
  - min
  - max
  - avg
  - warmup time
- Oil temp
  - min
  - max
  - avg
  - warmup time
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

- FAP regen last - "LastRegen" column
  - min
  - max
- FAP regen last 10 - "Avg10regen" column
  - min
  - max
- FAP deposits, cinder - "FAPdeposits", "FAPcinder" column
  - avg of both seperately
- FAP addative values - "FAPAdditiveVol", "FAPAdditiveRemain" column
  - max of "FAPAdditiveVol"
  - avg of "FAPAdditiveRemain"
- Fap pressure - "FAPpressure" column
  - min
  - max
  - avg
- Fap temp - "FAPtemp" column
  - min
  - max
  - avg
- FAPSoot - "FAPsoot" column
  - start
  - end
  - diff (start - end)
- Last Regen - "" column
  - end
- FAP Life, Life left - "FAP life", "FAPlifeLeft" column
  - avg of both seperately

Calculate:
- Idle FAP pressure
  - min
  - max
  - avg

### FAP Regen

- Do the calculations only when the REGEN hapened (REGEN=1), if not, return None
- Last regen (last value before REGEN change to 1)
  - km
- Duration (when REGEN = 1)
  - seconds
- Distance (when REGEN = 1)
  - km
- Speed (when REGEN = 1)
  - min
  - max
  - avg
- FAPtemp (when REGEN = 1)
  - min
  - max
  - avg
- Fap pressure (when REGEN = 1)
  - min
  - max
  - avg
- rev (when REGEN = 1)
  - min
  - max
  - avg
- Fap soot (when REGEN = 1)
  - start
  - end
  - diff
- Fuel consumption
  - l/100km (calculate seperately when regen was on and off)

### Plot

- fuel consumption vs speed
- fuel consumption vs rev
