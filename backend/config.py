import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Securely access variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ALLOWED_CLIENT_URL=os.getenv("ALLOWED_CLIENT_URL")
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "5"))
TIME_WINDOW = int(os.getenv("TIME_WINDOW", "60"))

if not OPENAI_API_KEY:
    raise ValueError("The OPENAI_API_KEY environment variable was not found.")

