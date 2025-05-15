import asyncio
import json
import nats


async def analyse_request():
    nc = await nats.connect("nats://localhost:4222")

    data = {"id": "DCM62v2_20240516"}

    await nc.publish("analyse.request", json.dumps(data).encode())


async def average_request():
    nc = await nats.connect("nats://localhost:4222")

    data = {
        "analyses": '[{"date":{"date":"2024-04-30","start":"18:23:59","end":"18:43:46"},"overall":{"distance":4.01,"duration":{"overall":1167,"engineOff":29,"engineOn":1138,"idle":510,"driving":628},"externalTemp":{"avg":24.0,"max":24.0,"min":24.0}},"driving":{"acceleration":{"max":41.0,"avg":19.25},"fuelConsumption":{"liters":0.41,"per_100km":10.15},"revs":{"min":0,"max":2276,"avg":1082,"avgDriving":1302},"speed":{"avg":12.37,"max":45.0,"min":0.0}},"engine":{"battery":{"beforeDrive":{"min":null,"max":null,"avg":null},"engineRunning":{"min":12.05,"max":14.4,"avg":14.17}},"coolantTemp":{"min":59,"max":98,"avg":80},"engineWarmup":{"coolant":null,"oil":null},"errors":1,"oilCarbonate":0,"oilDilution":1,"oilTemp":{"min":59,"max":95,"avg":80}},"fap":{"additive":{"vol":1260.0,"remain":806.0},"deposits":{"percentage":1.0,"weight_gram":1.0},"lastRegen":838,"lastRegen10":388,"life":{"life_avg":3066,"left_avg":159590},"pressure_idle":{"avg":7.5,"max":16.0,"min":0.0},"pressure":{"min":0.0,"max":46.0,"avg":9.8},"soot":{"start":17.95,"end":18.08,"diff":0.13},"temp":{"min":71,"max":225,"avg":155}},"fapRegen":null}, {"date":{"date":"2024-05-16","start":"08:19:54","end":"21:58:29"},"overall":{"distance":22.27,"duration":{"overall":3226,"engineOff":85,"engineOn":3141,"idle":606,"driving":2535},"externalTemp":{"avg":16.7,"max":24.0,"min":15.0}},"driving":{"acceleration":{"max":43.0,"avg":19.28},"fuelConsumption":{"liters":1.64,"per_100km":7.36},"revs":{"min":0,"max":2474,"avg":1259,"avgDriving":1398},"speed":{"avg":24.85,"max":72.0,"min":0.0}},"engine":{"battery":{"beforeDrive":{"min":null,"max":null,"avg":null},"engineRunning":{"min":12.02,"max":14.44,"avg":14.29}},"coolantTemp":{"min":25,"max":98,"avg":75},"engineWarmup":{"coolant":13.99,"oil":17.92},"errors":1,"oilCarbonate":0,"oilDilution":1,"oilTemp":{"min":19,"max":100,"avg":73}},"fap":{"additive":{"vol":1260.0,"remain":806.0},"deposits":{"percentage":1.0,"weight_gram":1.0},"lastRegen":909,"lastRegen10":388,"life":{"life_avg":3109,"left_avg":161833},"pressure_idle":{"avg":4.7,"max":20.0,"min":0.0},"pressure":{"min":0.0,"max":93.0,"avg":16.1},"soot":{"start":19.52,"end":20.3,"diff":0.78},"temp":{"min":27,"max":277,"avg":177}},"fapRegen":null}]'
    }

    await nc.publish("average.request", json.dumps(data).encode())


asyncio.run(analyse_request())
asyncio.run(average_request())
