import json
import os

import nats
import pytest


@pytest.mark.asyncio
async def test_nats_publish():
    # Connect to NATS server
    nc = await nats.connect("nats://localhost:4222")

    # Directory containing .csv files
    data_dir = "backend/data-analyser/data/"
    csv_files = [
        os.path.join(root, file)
        for root, _, files in os.walk(data_dir)
        for file in files
        if file.endswith(".csv")
    ]

    for file_path in csv_files:
        # Prepare data payload
        data = {"file_path": file_path}

        # Send request and await response
        response = await nc.request(
            "analyse.request", json.dumps(data).encode(), timeout=10
        )
        response_data = json.loads(response.data.decode())

        # Expected response structure
        expected_response = {
            "filename": file_path,
            "status": "Success",
            "reason": "",
            "analysis": response_data.get("analysis"),
        }

        # Assert response matches expected structure
        assert response_data == expected_response

    # Close NATS connection
    await nc.close()
