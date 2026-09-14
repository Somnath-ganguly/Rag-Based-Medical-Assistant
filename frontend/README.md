# Medical Chatbot Frontend UI

A responsive medical chatbot UI designed to interface with the existing FastAPI backend (`POST /ask/` and `POST /upload_pdfs/`).

## Features
- **Medical Query Chat**: Real-time interface connected to `/ask/` endpoint using `question` Form data.
- **Source Citation Cards**: Renders source PDF filenames and page numbers returned in the API response `sources` array.
- **PDF Document Upload**: Drag-and-drop document upload panel connected to `/upload_pdfs/` endpoint.
- **Customizable Server API URL**: Default set to `http://localhost:8000`, with collapsible settings to configure host URL if needed.
- **Dark & Light Mode**: Sleek medical dark/light theme options with glassmorphism and animated typing indicator states.
- **Responsive Layout**: Designed for desktop and mobile viewports with collapsible sidebar.

## Quick Start

### 1. Run the Backend API Server
Ensure your virtual environment is active and required environment variables (e.g. `PINECONE_API_KEY`, `GOOGLE_API_KEY`, etc.) are set in `server/.env`.

From the project root directory:
```bash
uvicorn server.main:app --reload --port 8000
```
*(or using python)*:
```bash
python -m uvicorn server.main:app --reload --port 8000
```

### 2. Launch the UI
You can open `frontend/index.html` directly in any web browser, or serve it using any HTTP server:

```bash
# Option A: Simple Python HTTP Server from frontend directory
cd frontend
python -m http.server 3000
```
Then visit `http://localhost:3000` in your web browser.
