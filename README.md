# CodeAtlas AI Frontend

Frontend application for CodeAtlas AI - repository understanding and architecture visualization.

## 🎯 Impact

> **Input:** GitHub repository URL  
> **Output:** Tech stack + AI summary + Architecture diagram + Engineering recommendations  
> **Time to Insight:** Under 60 seconds

## Overview

CodeAtlas AI helps developers understand unfamiliar GitHub repositories by generating intelligent summaries, visual architecture diagrams, and actionable engineering recommendations. Simply provide a GitHub repository URL and get comprehensive insights in seconds.

## ✨ Features

- GitHub Repository Analysis Interface
- Technology Stack Visualization
- Architecture Diagram Rendering
- Recommendation Dashboard
- Responsive User Experience

## 🛠 Technology Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- React Flow

## 🏗 Architecture

User → Next.js Frontend → FastAPI Backend → GitHub API + GitHub Models (GPT-5) → Analysis Results

## 🚀 Development

### Installation

```bash
npm install
npm run dev
```

## 🔐 Environment Variables

```env
NEXT_PUBLIC_API_URL=<your-backend-api-url>
```

## 🔗 Related Links

- Frontend: https://codeatlas-frontend-khaki.vercel.app/
- Backend API: https://codeatlas-backend-5hnr.onrender.com/docs
- Backend Repo: https://github.com/sejalsksagar/codeatlas-backend
- Frontend Repo: https://github.com/sejalsksagar/codeatlas-frontend

## 🤖 Microsoft AI Stack Integration

- GitHub Models (GPT-5)
- GitHub REST API
- GitHub Actions
- GitHub Copilot

## 🤖 AI Tools Disclosure

- ChatGPT
- Claude
- Gemini
- GitHub Copilot
- GitHub Models GPT-5

## 🗓 Future Improvements

- Fully editable React Flow diagrams
- Diagram export
- Repository chat assistant
- UML generation
- Multi-repository analysis

## 👥 Team CodeAtlas

Built for Microsoft Build AI Hackathon 2026.
