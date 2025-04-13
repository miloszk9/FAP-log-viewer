import asyncio

from nats_client.nats_client import NatsClient
from nats_client.nats_handler import NatsHandler


async def main():
    nats_client = NatsClient()
    await nats_client.connect()

    nats_handler = NatsHandler(nats_client)
    await nats_client.subscribe("tasks.execute", nats_handler.handle_message)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.run_forever()
