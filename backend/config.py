import os
from dotenv import load_dotenv

# Cargar las variables solo una vez
load_dotenv()

# Acceder de forma segura a las variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("❌ No se encontró la variable de entorno OPENAI_API_KEY")

