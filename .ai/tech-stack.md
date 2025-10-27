# FAP Log Analysis: Technology Stack Overview

This project utilizes a modern, decoupled architecture designed for scalability, resilience, and a seamless user experience. Each component is selected for its strengths, ensuring a robust and maintainable system.

---

## Frontend

**Astro** with **Tailwind CSS** and **shadcn/ui**

- _Astro_ is chosen for its high performance and developer-friendly approach to building fast, content-focused web interfaces.
- _Tailwind CSS_ enables rapid, utility-first, and responsive UI development.
- _shadcn/ui_ provides a headless, accessible set of React components built on Radix UI and styled with Tailwind CSS, enabling consistent, composable UI building blocks. Components are generated into the codebase for full control and theming.

## Backend (Main API)

**NestJS**

- A powerful Node.js framework used as the main API server.
- Handles user authentication, file uploads, and communication with the frontend.
- Provides a well-structured and scalable foundation for backend logic.

## Backend (Data Analysis)

**Python**

- Dedicated Python service for handling all log parsing and numerical analysis.
- Utilizes data science libraries such as Pandas for efficient processing of `.csv` files.
- Leverages Python's strengths in data manipulation and calculation.

## Inter-Service Communication

**NATS**

- Lightweight, high-performance message broker for decoupling the NestJS API from the Python analysis service.
- Enables asynchronous log processing, ensuring that the UI remains fast and responsive even when analysis is ongoing.

## Database

**PostgreSQL**

- Reliable, open-source relational database used to store user data and summary statistics from each log analysis.

## Deployment & CI/CD

**Docker & GitHub Actions**

- All services are containerized using Docker, ensuring consistency across development and production.
- _GitHub Actions_ automate the build, test, and deployment pipeline, enabling continuous integration and reliable updates.

---
