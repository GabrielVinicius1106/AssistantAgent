# 🧠 AgentApp - AI Productivity Agent

## Overview
An intelligent, autonomous agent designed to act as a personal productivity assistant. By processing natural language inputs, the system interprets intent, formats data, and executes actions across third-party ecosystems, starting with **Notion** (notes/tasks) and **Google Calendar** (events/reminders).

## Core Features
* **Natural Language to Action:** Converts conversational text into structured API calls using LLM Function Calling.
* **Autonomous Execution:** Seamlessly creates Calendar events and Notion database entries without manual UI interaction.
* **Context-Aware Memory:** Utilizes Retrieval-Augmented Generation (RAG) and Vector Databases to remember past user interactions and maintain conversational context.
* **Asynchronous Processing:** Powered by message brokers to handle third-party API latency and rate limits gracefully.

## Tech Stack
* **Database & Memory:** PostgreSQL (with `pgvector` for semantic search)
* **Cache & Message Broker:** Redis
* **AI Engine:** Foundation Models via API (OpenAI / Gemini / Claude / Ollama)
* **Infrastructure:** Docker & Docker Compose
* **Integrations:** OAuth 2.0, Notion API, Google Calendar API

## Getting Started
To spin up the local infrastructure (Database and Cache) for development:

1. Clone the repository.
2. Ensure Docker Desktop is running.
3. Execute the following command in the root directory:

```bash
docker compose up -d
```