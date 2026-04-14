# 🧠 AI Assistant Agent 

## Overview
An intelligent, autonomous agent designed to act as a personal productivity assistant. By processing natural language inputs, the system interprets intent, formats data, and executes actions across third-party ecosystems, starting with **Google Calendar** (events/reminders) and Integrated creation of Notes / Tasks.

## Core Features
* **Natural Language to Action:** Converts conversational text into structured API calls using LLM Function Calling.
* **Autonomous Execution:** Seamlessly creates Calendar events and database entries without manual UI interaction.
* **Context-Aware Memory:** Utilizes Retrieval-Augmented Generation (RAG) and Vector Databases to remember past user interactions and maintain conversational context.

## Tech Stack
* **Database & Memory:** PostgreSQL (with `pgvector` for semantic search)
* **Cache & Black List:** Redis
* **AI Engine:** Foundation Models via API (Ollama / Gemini)
* **Infrastructure:** Docker & Docker Compose
* **Integrations:** OAuth 2.0, Google Calendar API
