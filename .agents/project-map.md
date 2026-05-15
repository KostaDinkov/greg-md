# Project Map

Use this project map to understand the project structure and the role of each file. **Always consult this file when you need to understand where to place new files or find existing ones.**

* .agents/ - Agentic harness and configuration
    - AGENTS.md - Main constitution and role definition
    - project-map.md - This file (Dynamic project structure)
    - rules/ - Global and domain-specific rules (e.g., test-coverage.md, tech-stack-rules.md)
    - workflows/ - Markdown files detailing step-by-step processes for the AI (e.g., spec-driven-development.md)
    - templates/ - Boilerplate markdown templates for specs (e.g., feature-spec-template.md)
* docs/ - project documentation root
    - overview.md - project overview
    - architecture.md - project architecture
    - tech-stack.md - project tech stack
    - deployment.md - project deployment instructions
    - running-guide.md - project running and configuration guide
* specs/ - project and feature specifications
    - core/ - Core system specs (auth, database-schema, base-ui)
    - features/ - Feature-specific specifications
        - {feature-name}/
            - spec.md (unified description, requirements, and acceptance)
            - api-spec.md
            - data-model.md
* src/ - source code root
    - frontend/ - Next.js application code
    - backend/ - Python FastAPI / Pydantic AI service
* tests/ - test root
    - frontend/
    - backend/
    - e2e/
* data/ - test fixtures, sample lab PDFs, and mock wearable data for development
* docker/ - Dockerfiles and container configurations
* docker-compose.yml - Local development orchestration
* README.md - project README.
* .gitignore - project gitignore.
