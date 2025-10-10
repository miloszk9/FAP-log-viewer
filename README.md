# FAP Log Viewer

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/your-repo/ci.yml?branch=main)](https://github.com/your-username/your-repo/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web application for uploading and analyzing `.csv` log files from the FAP mobile app, providing insights into vehicle engine and FAP filter health.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

This application enables users to upload `.csv` log files from the FAP mobile app (used with Citroën and Peugeot vehicles). The backend processes these files asynchronously, stores summary data, and presents key vehicle parameters as calculated analytics. The goal is to transform raw vehicle data into actionable insights about engine performance and FAP filter condition.

The target audience includes technically-inclined Citroen and Peugeot owners, car enthusiasts, and DIY mechanics who want advanced tools for analyzing and interpreting log data.

## Tech Stack

The project uses a modern, decoupled architecture:

| Category                    | Technology                                                                  |
| --------------------------- | --------------------------------------------------------------------------- |
| **Frontend**                | [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/)     |
| **Backend (Main API)**      | [NestJS](https://nestjs.com/)                                               |
| **Backend (Data Analysis)** | [Python](https://www.python.org/) with [Pandas](https://pandas.pydata.org/) |
| **Database**                | [PostgreSQL](https://www.postgresql.org/)                                   |
| **Messaging Queue**         | [NATS](https://nats.io/)                                                    |
| **CI/CD**                   | [GitHub Actions](https://github.com/features/actions)                       |

## Deployment

For the deployment descirption check the [FAP-log-viewer-devops](https://github.com/miloszk9/FAP-log-viewer-devops) repo.

## Project Scope

This project is currently focused on delivering a Minimum Viable Product (MVP) with the following features.

### In Scope (MVP)

- **User Authentication:** Account creation with email/password and JWT-based sessions.
- **Secure Log Upload:** A web interface for uploading individual `.csv` log files.
- **Asynchronous Processing:** Uploaded files are sent via NATS to a Python service for analysis.
- **Single File Analysis Dashboard:** A dedicated page to view calculated statistics for each log, including:
  - Min/max/average values for key parameters (Engine Temp, RPM, etc.).
  - Calculated metrics like Distance Travelled and Fuel Consumption.
  - Visual warnings for FAP pressure thresholds.
  - Details of any FAP Regeneration events detected.
- **Log History:** A page listing all user uploads with their processing status ("Success", "Failed", "Processing..."). Users can delete entries from this list.
- **Cross-log summary dashboard:**
  - Min/max/average values for key parameters (Engine Temp, RPM, etc.).
  - Calculated metrics like Distance Travelled and Fuel Consumption.

### Out of Scope (for MVP)

- Password recovery mechanism.
- Ability for users to rename log files.
- Advanced user profile management.
- Graphical data visualization (charts, graphs).
- Comparison between multiple log files.

## Project Status

The project is currently in the **development phase** for the MVP.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.
