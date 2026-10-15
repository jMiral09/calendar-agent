# Calendar Agent

A chat-based AI assistant that manages your calendar using natural language. Type something like *"Schedule a meeting a day after tomorrow at 12 PM"* and the agent works out the date, creates the event, and replies with a confirmation.

<!-- Add a screenshot or GIF here, e.g. ![Demo](docs/demo.png) -->![Calendar AI Assistant](docs/demo_calendar_UI.pngimage.png)

## Features

- Natural-language event scheduling ("tomorrow at 6 AM", "a day after tomorrow")
- Chat UI with message history, a "Thinking..." indicator, and markdown-rendered replies
- Python agent with calendar tools, exposed through a FastAPI endpoint
- Next.js API route that proxies requests so the backend URL is never exposed to the browser

## Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, react-markdown |
| Backend  | Python, FastAPI, Uvicorn                     |
| Agent    | <!-- openai/gpt-oss-120b / Groq, LangChain --> |
| Calendar | <!-- Google Calendar API (OAuth) -->    |

## Architecture

```
Browser (chat-window.tsx)
   │  POST /api/assistant
   ▼
Next.js API route (client/app/api/assistant/route.ts)
   │  POST {FASTAPI_URL}/chat
   ▼
FastAPI (server/main.py)
   │
   ▼
Agent + calendar tools (server/agent/tools.py)
```

## Project Structure

```
calendar-agent/
├── client/                  # Next.js frontend
│   ├── app/
│   │   ├── api/assistant/   # API route that forwards to FastAPI
│   │   ├── assistant/       # Chat window component
│   │   └── page.tsx
│   └── lib/types.ts         # Shared request/response types
└── server/                  # FastAPI backend
    ├── main.py              # App and /chat endpoint
    ├── agent/tools.py       # Calendar tools used by the agent
    └── requirements.txt
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- <!-- API key for your LLM provider -->
- <!-- Google Cloud project with the Calendar API enabled, and an OAuth `credentials.json` -->

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/calendar-agent.git
cd calendar-agent
```

### 2. Set up the backend

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `server/.env` file with your keys:

```
# Example, adjust to your provider
# LLM_API_KEY=your-key-here
```

If you use Google Calendar, place your `credentials.json` in the `server` folder. The first run opens a browser window to authorize access and creates a local `token.json`.

Start the server:

```bash
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive docs are at `http://127.0.0.1:8000/docs`.

### 3. Set up the frontend

In a second terminal:

```bash
cd client
npm install
```

Create `client/.env.local`:

```
FASTAPI_URL=http://127.0.0.1:8000
```

Use no trailing slash. Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting.

## API

### `POST /chat`

Request:

```json
{ "message": "Schedule a standup tomorrow at 10 am" }
```

Response:

```json
{ "reply": "Your standup has been scheduled for ..." }
```

## Environment Variables

| Variable      | Location          | Description                          |
| ------------- | ----------------- | ------------------------------------ |
| `FASTAPI_URL` | `client/.env.local` | Base URL of the FastAPI server       |
| <!-- your LLM key name --> | `server/.env` | API key for the LLM provider |

Never commit `.env` files, `credentials.json`, or `token.json`. They are listed in `.gitignore`.

## Troubleshooting

- **`POST //chat 404` in the FastAPI log:** `FASTAPI_URL` has a trailing slash. Remove it and restart `npm run dev`.
- **Chat shows "Something went wrong":** check both terminals. A 404 on `/api/...` means the frontend is calling the wrong route; a long hang usually means the agent or a tool is stuck.
- **`{"detail":"Not Found"}` at `http://127.0.0.1:8000/`:** expected. The API has no route at `/`; use `/docs`.

## Roadmap

- [ ] Reschedule and cancel events
- [ ] List upcoming events
- [ ] Email integration
- [ ] Streaming responses

## License


