import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Securely access variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
FRONTEND_URL=os.getenv("FRONTEND_URL")

if not OPENAI_API_KEY:
    raise ValueError("The OPENAI_API_KEY environment variable was not found.")

