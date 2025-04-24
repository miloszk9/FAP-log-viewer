import os

import requests
from flask import Flask, Response, request, send_from_directory

app = Flask(__name__, static_folder="src")

# Backend service URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/api/<path:path>", methods=["GET", "POST"])
def proxy(path):
    # Construct the target URL
    target_url = f"{BACKEND_URL}/{path}"

    # Forward the request method, headers, and body
    resp = requests.request(
        method=request.method,
        url=target_url,
        headers={key: value for key, value in request.headers if key != "Host"},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
    )

    # Create the response
    excluded_headers = [
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
    ]
    headers = [
        (name, value)
        for name, value in resp.raw.headers.items()
        if name.lower() not in excluded_headers
    ]

    response = Response(resp.content, resp.status_code, headers)
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
