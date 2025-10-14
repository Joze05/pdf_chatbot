import time
import os
from backend.config import RATE_LIMIT, TIME_WINDOW
from fastapi import Request, HTTPException, status

# Diccionary: { ip: [requests_timestamp] }
request_counts = {}

async def simple_rate_limiter(request: Request):
    """Simple rate limiter based on IP."""
    client_ip = request.client.host
    now = time.time()

    # Clean old registers
    timestamps = request_counts.get(client_ip, [])
    timestamps = [t for t in timestamps if now - t < TIME_WINDOW]

    # Save the new updated timestamps
    request_counts[client_ip] = timestamps

    if len(timestamps) >= RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Limit: {RATE_LIMIT} per {TIME_WINDOW} seconds."
        )

    # Register this request
    request_counts[client_ip].append(now)
