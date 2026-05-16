# Technology Stack

Based on the goal of building a robust, privacy-centric, and maintainable AI health agent app, the following technology stack has been selected:

## Frontend

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI Library**: React (with shadcn/ui and Tailwind CSS for rapid, clean styling)
- **Data Visualization**: Recharts (for rendering lab metrics, tracking charts, and tables)
- **AI Integration**: Vercel AI SDK (for streaming LLM responses and generating dynamic UI components)
- **State Management**: React Query / Zustand (as needed)

## Backend

- **Framework**: FastAPI (Python) - highly performant, excellent for async I/O, built on Pydantic.
- **Language**: Python 3.12+ (industry standard for AI engineering and data processing)
- **Agentic Framework**: Pydantic AI - for structuring agent workflows, LLM validation, and robust type-safe data extraction from labs.
- **LLM Integration**: Direct API integration (Google Gemini) with user-configurable API keys.
- **Data Processing**: PyPDF2/pdfplumber, unstructured.io, or multimodal LLMs for lab report/PDF parsing.

## Database & Storage

- **Relational Data**: PostgreSQL
- **Vector Search**: pgvector (extension for PostgreSQL) - useful for semantic search across health logs and RAG (Retrieval-Augmented Generation).
- **ORM**: SQLAlchemy or SQLModel (which integrates seamlessly with FastAPI and Pydantic).

## Infrastructure & Deployment

- **Containerization**: Docker & Docker Compose
  - The entire application (Frontend, Backend, Database) will be containerized.
  - This allows for local-first deployment (e.g., running on a user's local machine or homelab for privacy in the EU).
- **Cloud-Agnostic**: Since it's containerized, it can easily be deployed to AWS (ECS/EKS), DigitalOcean, or render.com later.
