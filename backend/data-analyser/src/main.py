import asyncio
from nats_client.nats_client import NatsClient


async def main():
    nats_client = NatsClient()
    await nats_client.connect()
    await nats_client.subscribe("tasks.execute", nats_client.handle_message)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.run_forever()
