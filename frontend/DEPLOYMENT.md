# Complete Deployment Guide - Medical Chatbot

This guide provides step-by-step instructions to deploy both the **FastAPI Backend** and the **Frontend UI** to production for free or low-cost hosting platforms.

---

## Overview

```mermaid
graph LR
    User[User Browser] -->|HTTP / HTTPS| Frontend[Frontend (Vercel / Netlify / GitHub Pages)]
    Frontend -->|API Requests POST /ask/ & /upload_pdfs/| Backend[FastAPI Server (Render / Railway)]
    Backend --> Pinecone[(Pinecone Vector DB)]
    Backend --> Gemini[Google Gemini API]
```

---

## Phase 1: Deploying the FastAPI Backend

### Option A: Deploy on Render (Recommended & Free)

1. **Push your code to GitHub**:
   Ensure your project is in a GitHub repository.

2. **Create a New Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
   - Connect your GitHub repository.

3. **Configure Settings**:
   - **Name**: `medical-chatbot-backend`
   - **Root Directory**: `server`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

4. **Set Environment Variables**:
   In Render's **Environment Variables** tab, add your secrets:
   - `GOOGLE_API_KEY`: `your_google_gemini_api_key`
   - `PINECONE_API_KEY`: `your_pinecone_api_key`
   - `PINECONE_INDEX_NAME`: `medicalindex`
   - `GROQ_API_KEY`: `your_groq_api_key`

5. **Deploy**:
   Click **Create Web Service**. Render will deploy your API and give you a URL like:
   `https://medical-chatbot-backend.onrender.com`

---

### Option B: Deploy on Railway

1. Sign in to [Railway.app](https://railway.app/).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select your repository and root directory as `server`.
4. Add Environment Variables under **Variables**.
5. Railway will automatically detect Python and deploy your server.

---

## Phase 2: Deploying the Frontend UI

Since the frontend is built with clean HTML5, CSS, and Vanilla JS, it can be hosted for **free** on Vercel, Netlify, or GitHub Pages.

### Option A: Deploy on Vercel (Fastest)

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Import your GitHub repository.
3. **Framework Preset**: Select `Other`.
4. **Root Directory**: Select `frontend`.
5. Click **Deploy**. Vercel will give you a domain like:
   `https://medical-chatbot-ui.vercel.app`

---

### Option B: Deploy on Netlify

1. Log into [Netlify](https://www.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Connect your GitHub repository.
4. Set **Publish directory** to `frontend`.
5. Click **Deploy site**.

---

### Option C: Host on GitHub Pages

1. Push your repository to GitHub.
2. Go to **Repository Settings** > **Pages**.
3. Set source branch to `main` and folder to `/frontend`.
4. Save. Your site will be published at `https://<your-username>.github.io/<repo-name>/`.

---

## Phase 3: Connect Frontend to Deployed Backend

Once both are deployed:

1. Open your deployed Frontend website URL (e.g. `https://medical-chatbot-ui.vercel.app`).
2. Expand the **Backend Server API** settings panel in the sidebar (or bottom settings).
3. Change `http://localhost:8000` to your deployed backend URL:
   ```text
   https://medical-chatbot-backend.onrender.com
   ```
4. Alternatively, you can change the default fallback value on line 35 in `frontend/app.js`:
   ```javascript
   if (!url) url = 'https://medical-chatbot-backend.onrender.com';
   ```

---

## CORS Checklist

Your `server/main.py` already includes open CORS setup (`allow_origins=["*"]`), so your frontend will be able to make requests to the backend cross-origin without CORS issues!
