# 🧠 AI PDF Chatbot

Un chatbot inteligente que te permite **hacer preguntas sobre el contenido de un documento PDF** en lenguaje natural.  
El proyecto está compuesto por un **frontend moderno con React** y un **backend construido en FastAPI**, utilizando los modelos de OpenAI para procesar las consultas.

![Demo](./readme_files/demo_chatbot.gif)

---

## 🚀 Características principales

- 📄 **Lectura de documentos PDF** y análisis semántico.
- 💬 **Interacción en tiempo real** con respuestas generadas por IA.
- 🔄 **Streaming de respuestas** del modelo (sin tiempos de espera largos).
- 🧾 **Conteo de tokens** por sesión.
- ⚠️ **Manejo elegante de errores** tanto en el frontend como en el backend.

---

## 🎨 Desiciones de diseño

- **Frontend:** React con un enfoque en la simplicidad visual.  
  Se priorizó una interfaz limpia y centrada en la conversación, usando componentes personalizados sin frameworks complejos.  
  La comunicación con el backend se hace vía **Server-Sent Events (SSE)** para ofrecer un flujo continuo de texto mientras la IA responde.

- **Backend:** Estructura modular con rutas bien definidas, control de errores estandarizado y soporte para variables de entorno, además de un middleware para el control de consultas.

- **Token tracking:** Se decidió calcular los tokens directamente desde la respuesta del modelo de OpenAI y mostrarlos en el frontend para ofrecer transparencia al usuario.

---

## 🧩 Retos y soluciones

### 1. **Streaming de respuestas**
   - **Desafío:** FastAPI no permite directamente iterar sobre objetos de tipo `ChatCompletionStreamManager`.  
   - **Solución:** Se implementó un `async generator` para enviar los fragmentos de texto conforme el modelo los produce, garantizando compatibilidad con SSE.

### 2. **Conteo de tokens**
   - **Desafío:** OpenAI solo devuelve los tokens al finalizar la respuesta.  
   - **Solución:** Se agregó un contador acumulativo en el backend que envía los totales al terminar cada mensaje, permitiendo mostrarlos al usuario.

---

## 🔧 Que mejoraría si tuviera más tiempo

- Agregar **persistencia en base de datos** (por ejemplo, SQLite o DynamoDB) para conservar conversaciones.
- Incorporar **autenticación de usuarios** para que cada uno gestione sus propios documentos.
- Implementar **rate limiting avanzado** en el backend.
- Mejorar el **renderizado Markdown** y añadir soporte para **imágenes o tablas** en las respuestas.
- Crear una interfaz para **subir y administrar múltiples PDFs** por sesión.

---

## ⚙️ Instalación y Ejecución

### 🧰 Prerrequisitos

- **Node.js 18+**
- **Python 3.12**
- **Cuenta y API Key de OpenAI**

---

### 🌍 Variables de entorno

Crea un archivo `.env` basado en el `.env.example` incluido en el proyecto.  
Ejemplo de contenido:

```bash
# OpenAI
OPENAI_API_KEY=tu_openai_api_key

# Backend
VITE_BACKEND_URL=tu_ruta_servidor_backend (ejemplo: http://127.0.0.1:8000)
RATE_LIMIT=limite_de_mensajes
TIME_WINDOW=ventana_limite_de_mensajes

# Frontend
ALLOWED_CLIENT_URL=tu_ruta_servidor_frontend (ejemplo: http://127.0.0.1:4321)
```

---

### 🖥️ Backend (FastAPI)

### Importante! 
Ejecutar en Python 3.12 para evitar problemas de compatibilidad de dependencias.

1. Instala las dependencias:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Inicia el servidor:
   ```bash
   cd ..
   uvicorn backend.main:app
   ```

   El backend estará disponible de manera predeterminada en:  
   👉 http://127.0.0.1:8000

---

### 💻 Frontend (React + Vite)

1. Instala las dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

   El frontend se ejecutará de manera predeterminada en:  
   👉 http://localhost:5173

---

## 📊 Ejemplo de Uso

1. El documento se encuentra cargado de manera predeterminada.
2. Escribe una pregunta en el cuadro de texto.
3. Observa cómo el asistente responde en tiempo real.
4. Conversa sobre cualquier tema que el PDF abarque.

---

## 🧩 Tecnologías utilizadas

| Categoría | Herramientas |
|------------|---------------|
| Frontend | React, Vite, Fetch API |
| Backend | FastAPI, OpenAI SDK, Uvicorn |
| IA | GPT-5-nano |
| Otros | SSE (Server-Sent Events), Python-dotenv |

---

## 🧠 Autor

**Jose Alvarado**  
Full-Stack Developer · Backend-AI-oriented  
