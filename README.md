# Atlas - AI Chat System with Web Search

A modern, full-stack AI chat application built with Next.js, featuring Google OAuth authentication, streaming AI responses, and integrated web search capabilities.

![Atlas AI Chat](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- **🔐 Google OAuth Authentication** - Secure sign-in with Google accounts
- **💬 Real-time Streaming Chat** - Live AI responses with typing indicators
- **🔍 Web Search Integration** - Search the web with image results rendering
- **🌙 Dark/Light Mode** - Automatic theme detection with manual toggle
- **📱 Responsive Design** - Beautiful UI on desktop and mobile
- **⚡ Fast & Modern** - Built with Next.js 15 and React Query

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account (for OAuth)
- OpenAI API key
- Serper API key (optional, for web search)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your API keys.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Configuration

### Required Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `AUTH_SECRET` | NextAuth.js secret key | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | [Google Cloud Console](https://console.cloud.google.com) |
| `OPENAI_API_KEY` | OpenAI API key for chat | [OpenAI Platform](https://platform.openai.com/api-keys) |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o-mini` |
| `SERPER_API_KEY` | Serper.dev API key for web search | Uses mock data |
| `AUTH_URL` | Base URL for authentication | `http://localhost:3000` |

## 📝 Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen:
   - Add your app name and email
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local`

### Production OAuth Setup

For production, add your deployed URL:
- Authorized JavaScript origins: `https://your-domain.com`
- Authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`

## 🔍 Setting Up Web Search (Optional)

1. Go to [Serper.dev](https://serper.dev)
2. Sign up for a free account (2,500 searches/month)
3. Copy your API key to `SERPER_API_KEY` in `.env.local`

Without Serper API key, the app will use mock search results for demonstration.

## 💾 Setting Up Supabase (For Chat Persistence)

Chat history is stored in Supabase. Follow these steps to set it up:

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be provisioned

### 2. Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy the following values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### 3. Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase/migrations/001_create_tables.sql`
3. Run the query to create tables with Row Level Security

### Database Schema

The app uses two tables:

**chats**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | User's auth ID |
| title | TEXT | Chat title |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**messages**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| chat_id | UUID | Foreign key to chats |
| user_id | TEXT | User's auth ID |
| role | TEXT | 'user' or 'assistant' |
| content | TEXT | Message content |
| search_results | JSONB | Web search results |
| search_images | JSONB | Image search results |
| created_at | TIMESTAMP | Creation time |

### Security

- **Row Level Security (RLS)** is enabled on both tables
- Users can only access their own chats and messages
- The service role key bypasses RLS for server-side operations

## 🎨 Features Overview

### Chat Mode
- Real-time streaming responses from GPT-4o-mini (or configured model)
- Markdown formatting support
- Code syntax highlighting
- Message history within session

### Search Mode
- Web search with AI-powered summaries
- Image results displayed inline
- Source citations with clickable links
- Expandable/collapsible results

### UI/UX
- Atlas-inspired modern design
- Smooth animations and transitions
- Keyboard shortcuts (Enter to send)
- Loading states and error handling

## 📁 Project Structure

```
ai-chat/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth API routes
│   │   │   ├── chat/                # Chat streaming API
│   │   │   └── search/              # Web search API
│   │   ├── login/                   # Login page
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── components/
│   │   ├── chat/                    # Chat components
│   │   │   ├── chat-input.tsx
│   │   │   ├── chat-interface.tsx
│   │   │   ├── chat-message.tsx
│   │   │   ├── search-results.tsx
│   │   │   └── user-menu.tsx
│   │   └── ui/                      # UI components
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utility functions
│   ├── providers/                   # React context providers
│   └── types/                       # TypeScript types
├── .env.example                     # Environment template
├── next.config.ts                   # Next.js configuration
└── package.json
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Update `AUTH_URL` to your production URL
5. Update Google OAuth redirect URIs for production

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Docker containers

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + Custom shadcn/ui
- **Authentication**: NextAuth.js v5 (Auth.js)
- **State Management**: React Query (TanStack Query)
- **AI Provider**: OpenAI API
- **Search**: Serper.dev API
- **Icons**: Lucide React

## 📄 License

This project is created for demonstration purposes as part of a technical assessment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and OpenAI
