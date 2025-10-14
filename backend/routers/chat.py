# backend/routers/chat.py
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
    """Crea el prompt del sistema con contexto del PDF."""
    return (
        "You are an assistant that answers questions using ONLY the provided PDF content. "
        "If info is missing, say you don't know. Be concise.\n\n"
        f"---\n{pdf_text[:CONTEXT_CHARS]}\n---"
    )

async def stream_answer(messages: list):
    """Generador de chunks de texto desde OpenAI."""
    acc = []
    try:
        stream = client.chat.completions.stream(
            model="gpt-5-nano",
            messages=messages,
            temperature=1
        )
        async for chunk in stream:
            for choice in getattr(chunk, "choices", []):
                delta = getattr(choice, "delta", {})
                if isinstance(delta, dict):
                    content = delta.get("content")
                    if content:
                        acc.append(content)
                        # Enviar chunk como JSON SSE
                        yield json.dumps({"type": "content", "content": content})
        await stream.aclose()
    except Exception as e:
        # Fallback si streaming falla
        try:
            fallback = client.chat.completions.create(
                model="gpt-o4-mini",
                messages=messages,
                temperature=1
            )
            text = ""
            choices = getattr(fallback, "choices", [])
            if choices:
                msg = getattr(choices[0], "message", None)
                if msg:
                    text = getattr(msg, "content", "") or msg.get("content", "")
            if text:
                acc.append(text)
                yield json.dumps({"type": "content", "content": text})
        except Exception as fallback_exc:
            yield json.dumps({
                "type": "error",
                "content": f"Streaming failed: {str(e)}; fallback failed: {str(fallback_exc)}"
            })

@router.post("/chat")
async def chat(request: Request):
    """
    Endpoint POST /chat
    Body: {"message": "...", "conversation_id": "..."}
    Respuesta: SSE JSON chunks
    """
    data = await request.json()
    message = data.get("message")
    if not message:
        raise HTTPException(400, detail="Missing 'message' in request body")

    session_id = data.get("conversation_id") or "default"
    histories[session_id].append({"role": "user", "content": message})

    # Construir mensajes con system prompt + historial
    messages = [{"role": "system", "content": system_prompt(get_pdf_content())}] + histories[session_id]

    async def generator():
        answer = ""
        async for chunk in stream_answer(messages):
            answer += json.loads(chunk)["content"]
            yield chunk
        # Guardar respuesta final en historial
        if answer:
            histories[session_id].append({"role": "assistant", "content": answer})
        # Señal de finalización SSE
        yield json.dumps({"type": "done"})

    return EventSourceResponse(generator())
