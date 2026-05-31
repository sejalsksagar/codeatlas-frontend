# CodeAtlas AI Frontend

Frontend application for CodeAtlas AI - repository understanding and architecture visualization.

## 🎯 Impact

> **Input:** GitHub repository URL  
> **Output:** Tech stack + AI summary + Architecture diagram + Engineering recommendations  
> **Time to Insight:** Under 60 seconds

## Overview

CodeAtlas AI helps developers understand unfamiliar GitHub repositories by generating intelligent summaries, visual architecture diagrams, and actionable engineering recommendations. Simply provide a GitHub repository URL and get comprehensive insights in seconds.

## ✨ Features

- **GitHub Repository Analysis Interface** - Seamless integration with GitHub repositories
- **Technology Stack Visualization** - Automatically detect and display tech stack composition
- **Architecture Diagram Rendering** - Interactive visual representation of codebase architecture
- **Recommendation Dashboard** - AI-powered suggestions for improvements and best practices
- **Responsive User Experience** - Optimized for all device sizes

## 🛠 Technology Stack

- **Next.js 14** - React framework for production
- **React** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Flow** - Interactive diagram library

**Language Composition:**
- TypeScript: 96.3%
- CSS: 2.7%
- JavaScript: 1%

## 🏗 Architecture

```
User
  ↓
Next.js Frontend
  ↓
FastAPI Backend
  ↓
GitHub API + GitHub Models (GPT-5)
  ↓
Analysis Results
```

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

Install dependencies:

```bash
npm install
```

### Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=<your-backend-api-url>
```

## 🔗 Related Links

- **Live Application:** [Frontend URL]
- **Backend Repository:** [Backend GitHub URL]
- **Backend API:** [Render URL]

## 🤖 Microsoft AI Stack Integration

- **GitHub Models** - Powered by GPT-5 for intelligent analysis
- **GitHub REST API** - Repository data retrieval
- **GitHub Actions** - Automated workflows
- **GitHub Copilot** - AI-assisted development

## 🗓 Future Improvements

- Fully editable React Flow diagrams with drag-and-drop
- Diagram export (PNG, SVG, PDF)
- Repository chat assistant for interactive Q&A
- Enhanced architecture visualization with custom themes
- Code snippet analysis and explanation
- Performance metrics and optimization suggestions

## 📄 License

MIT

---

**Built with ❤️ for developers who want to understand code faster**
