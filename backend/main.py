from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.services.pdf_reader import load_pdf_content
from backend.routers import chat
from backend.config import FRONTEND_URL

app = FastAPI(title="Chatbot PDF API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    """Loads the PDF on server startup"""
    try:
        load_pdf_content()
    except Exception as e:
        print(f"Error loading the PDF file: {e}")


@app.get("/")
def root():
    return {"message": "Chatbot PDF API is running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "chatbot-pdf-backend"
    }


app.include_router(chat.router)