from fastapi import APIRouter, Request, HTTPException
from sse_starlette.sse import EventSourceResponse
from collections import defaultdict
from typing import Optional
from backend.config import OPENAI_API_KEY
from backend.services.pdf_reader import get_pdf_content
from openai import OpenAI
import json

router = APIRouter()
histories = defaultdict(list)
client = OpenAI(api_key=OPENAI_API_KEY)
CONTEXT_CHARS = 50_000

def system_prompt(pdf_text: str) -> str:
    """Create the system prompt with PDF context"""
    return (
        "You are an assistant that answers questions using ONLY the provided PDF content. "
        "If info is missing, say you don't know. Be concise.\n\n"
        f"---\n{pdf_text[:CONTEXT_CHARS]}\n---"
    )

async def stream_answer(messages: list):
    """Text chunk generator from OpenAI (real streaming)."""
    acc = []
    try:
        # This stream is NOT asynchronous; it iterates normally.
        stream = client.chat.completions.stream(
            model="gpt-5-nano",
            messages=messages,
            temperature=1
        )

        # We iterate over the events in the stream.
        for event in stream:
            if event.type == "message.delta" and event.delta:
                content = event.delta.get("content")
                if content:
                    acc.append(content)
                    # Immediately issue the SSE chunk
                    yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"

            elif event.type == "message.completed":
                break

        stream.close()

    except Exception as e:
        # If streaming fails, we fall back to a normal request.
        try:
            fallback = client.chat.completions.create(
                model="gpt-5-nano",
                messages=messages,
                temperature=1
            )
            text = fallback.choices[0].message.content
            acc.append(text)
            yield f"data: {json.dumps({'type': 'content', 'content': text})}\n\n"
        except Exception as fallback_exc:
            yield f"data: {json.dumps({'type': 'error', 'content': f'Streaming failed: {str(e)}; fallback failed: {str(fallback_exc)}'})}\n\n"


@router.post("/chat")
async def chat(request: Request):
    """
    Endpoint POST /chat
    Body: {"message": "...", "conversation_id": "..."}
    Response: SSE JSON chunks
    """
    data = await request.json()
    message = data.get("message")
    if not message:
        raise HTTPException(400, detail="Missing 'message' in request body")

    session_id = data.get("conversation_id") or "default"
    histories[session_id].append({"role": "user", "content": message})

    # Build messages with system prompt + history
    messages = [{"role": "system", "content": system_prompt(get_pdf_content())}] + histories[session_id]

    async def generator():
        answer = ""
        async for chunk in stream_answer(messages):
            # We clean up the SSE format (“data: ...\n\n”)
            clean = chunk.strip()
            if clean.startswith("data:"):
                clean = clean[len("data:"):].strip()

            # We only process it if it is valid JSON.
            if clean:
                try:
                    data = json.loads(clean)
                    if data.get("type") == "content":
                        answer += data["content"]
                except json.JSONDecodeError:
                    pass

            # We send the SSE chunk to the client.
            yield chunk

        if answer:
            histories[session_id].append({"role": "assistant", "content": answer})

        # Completion signal
        yield "data: {\"type\": \"done\"}\n\n"


    return EventSourceResponse(generator())
