import asyncio
import json
import nats

async def main():
    nc = await nats.connect("nats://localhost:4222")

    data = {
        "file_path": "/home/mylosz/github/FAP-log-viewer/backend/data-analyser/data/DCM62v2_20240430.csv"
    }

    # Send a message and wait for reply
    response = await nc.request("tasks.execute", json.dumps(data).encode(), timeout=10)
    print("📬 Got response:")
    print(response.data.decode())

asyncio.run(main())
