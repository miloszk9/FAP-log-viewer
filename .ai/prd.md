# Product Requirements Document

## FAP Log Analysis Web App (MVP)

---

### 1. Objective

Develop a Minimum Viable Product (MVP) web application enabling users to upload `.csv` log files from the FAP mobile app. These logs will be processed, summary data stored, and key vehicle parameters presented as clear, calculated analytics—transforming raw data into actionable insights about engine and FAP filter health.

---

### 2. Target Audience

Technically-inclined Citroen and Peugeot owners, car enthusiasts, and DIY mechanics who already use the FAP mobile application and want advanced tools for analyzing and interpreting log data.

---

### 3. Key Features (MVP Scope)

#### **User Authentication**

- Users can create accounts with email and password.
- Authentication managed using JWT tokens (24-hour session validity).
- Simple "Logout" function included.

#### **Secure Log Upload & Processing**

- Web interface for uploading individual `.csv` log files (unlimited concurrent uploads).
- Backend leverages NATS to send uploaded files asynchronously to the Python analysis service.
- Python service attempts to parse file against two pre-defined engine profiles; the first successful match is used.
- If both parsing attempts fail, log analysis is marked as "Failed".

#### **Single File Analysis Dashboard**

- After processing, each log’s calculated statistics are viewable on its own dashboard page.
- Dashboard displays min/max/avg for key parameters (e.g., Engine Temp, FAP Temp, RPM, Speed).
- Includes metrics such as **Distance Travelled** and **Fuel Consumption**.
- **FAP Pressure thresholds are visually indicated:**
  - _Idle Pressure:_ Warning (>15 mbar), Error (>50 mbar).
  - _Driving Pressure:_ Warning (>300 mbar), Error (>400 mbar).
- If a FAP Regeneration event is detected, a dedicated dashboard section shows key details (e.g., duration, max temperature).
- If a metric cannot be calculated (e.g., no idle time), it is shown as `"N/A"`.

#### **Log History**

- "Log History" page lists all user’s uploads, sorted alphabetically by filename.
- Each entry displays:
  - Original filename
  - Upload date/time
  - Final processing status ("Success", "Failed", or "Processing...")
  - Indicator if a FAP Regeneration event is present
- Users can delete entries from their history.

---

### 4. User Experience & Design

- **Navigation:** Simple top-level navigation bar ("Upload", "Log History", "Logout").
- **Upload Flow:** After upload, users are redirected to "Log History"; new uploads appear at the top with a _Processing…_ status, auto-updating (polling every 1-2 seconds, up to 1 minute).
- **Mobile Responsiveness:** Full desktop and mobile usability.
- **Error Handling:** On analysis failure, display:  
  `"Analysis failed. The file may be corrupt or in an unsupported format."`

---

### 5. Out of Scope for MVP

- Cross-log "Summary Dashboard"
- Password recovery mechanism
- User ability to rename log files
- Advanced user profile management
- Graphical data visualization (charts, graphs)
- Comparison between multiple log files

---

### 6. Measurable Success Criteria

- **User Adoption:** 100 weekly active users
- **User Engagement:** Average of 10 `.csv` log uploads per user
- **System Reliability:** 80%+ of uploads are successfully analyzed  
  (Failures = script crash, invalid file format, or unhandled exception)

---

### 7. Technology Stack

- **Frontend:** Astro, Tailwind CSS
- **Backend (Main API):** NestJS
- **Backend (Data Analysis):** Python
- **Inter-Service Communication:** NATS message broker
- **Database:** PostgreSQL (store only summary statistics per analysis)
- **Deployment:** Docker containers for all services
- **CI/CD:** GitHub Actions
