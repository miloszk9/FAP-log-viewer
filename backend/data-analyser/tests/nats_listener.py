import asyncio
import json
import nats
from datetime import datetime


async def message_handler(msg):
    """Handle incoming NATS messages"""
    subject = msg.subject
    data = msg.data.decode()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

    print(f"\n[{timestamp}] 📬 Received message on topic: {subject}")
    print(f"Data: {data}")

    # Try to parse as JSON if possible
    try:
        json_data = json.loads(data)
        print(f"Parsed JSON: {json.dumps(json_data, indent=2)}")
    except json.JSONDecodeError:
        print("Data is not valid JSON")


async def main():
    # Connect to NATS server
    print("Connecting to NATS server at nats://localhost:4222...")
    nc = await nats.connect("nats://localhost:4222")
    print("Connected to NATS server!")

    # Subscribe to all topics with wildcard
    print("Subscribing to all topics with wildcard '>'...")
    await nc.subscribe(">", cb=message_handler)
    print("Listening for messages on all topics. Press Ctrl+C to exit.")

    # Keep the script running
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")
        await nc.close()
        print("Disconnected from NATS server.")


if __name__ == "__main__":
    asyncio.run(main())
