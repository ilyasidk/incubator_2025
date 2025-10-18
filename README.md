WEBSITE LINK https://incubator-2025.onrender.com

# Flashcards Master

**Pet Project**: AI-powered flashcard learning platform

Web application for creating and studying flashcards with artificial intelligence integration.

## Description

Flashcards Master is an educational platform that helps users learn new concepts through interactive flashcards. The application allows users to create their own sets of cards on various topics, study them, and track their progress. A unique feature is the ability to generate cards using artificial intelligence.

Main features:
* User management (registration, login)
* Creating and managing card topics
* Creating, viewing, editing and deleting cards
* Tracking learning progress

## Technology Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose)
* **Authentication:** JSON Web Tokens (JWT) using `bcryptjs` for password hashing
* **Frontend:** HTML, CSS, Vanilla JavaScript
* **Styling:** Tailwind CSS
* **Deployment:** Docker, GitHub Actions (CI)

### Why this stack?

* **Node.js/Express:** Chosen for high performance in I/O operations (important for web server), extensive package ecosystem (npm), ability to use JavaScript on both backend and frontend, and rapid development of RESTful APIs.
* **MongoDB:** NoSQL database flexibility is well-suited for storing documents like users, topics, and cards, whose structure may change. Mongoose simplifies database interaction and schema validation.
* **Vanilla JS/HTML/CSS:** For the current scope of frontend functionality, complex state management or component systems provided by frameworks (React, Vue, Angular) were not required. This allowed maintaining frontend lightness and avoiding additional build steps (except for Tailwind).
* **Tailwind CSS:** Utility-first approach significantly speeds up user interface development, ensures style consistency, and facilitates responsive design creation.
* **Docker:** Ensures runtime environment consistency between development and production, simplifies deployment and application isolation.
* **JWT:** Standard and secure way to implement API authentication.

## Installation and Setup

### Requirements

* Node.js (version 18.x, as specified in `Dockerfile` and `ci.yml`)
* npm
* MongoDB (locally or remotely, requires connection string)
* Docker (for running backend in container)

### Backend

1. Navigate to `backend` directory: `cd backend`
2. Create `.env` file in the root of `backend` directory and add necessary environment variables:
    ```dotenv
   MONGODB_URI=mongodb://your_mongo_uri # Connection string to your MongoDB
   PORT= # Port on which backend will run
   JWT_SECRET=your_jwt_secret_key # Secret key for signing JWT tokens
   NODE_ENV=development # Set to 'production' for production build
   ```
3. Install dependencies: `npm install` (or `npm ci` to use `package-lock.json`)
4. Run development server (with auto-reload via `nodemon`): `npm run dev`
   Or run production server: `npm start`
5. (Optional) Populate database with test data (user `test@example.com`/`password123` and example topics/cards): `npm run seed`. **Warning:** This script deletes existing data!

### Frontend

1. Navigate to `frontend` directory: `cd frontend`
2. Install development dependencies: `npm install`
3. Run development server (`live-server`) and automatic Tailwind CSS compilation: `npm start`
   This will open the application in browser (usually `http://localhost:3000`) and track changes in `src/input.css` and HTML/JS files.

### Docker (Backend)

1. Ensure Docker is running.
2. Navigate to `backend` directory: `cd backend`
3. Ensure you have `.env` file with necessary variables in this directory.
4. Build Docker image: `docker build -t flashcards-backend .`
5. Run container: `docker run -p 8080:8080 --env-file .env --name flashcards-app flashcards-backend`

## Design and Development Process

Development was carried out iteratively, focusing on rapid implementation of core functionality.

* **API Design:** Designed following RESTful principles. Resources (users, topics, cards, progress, generation) are separated into individual routes (`backend/routes`). Middleware (`backend/middleware/auth.js`) is used for protecting routes with JWT.
* **Database Structure:** Mongoose schemas (`backend/models`) are defined for main entities (`User`, `Topic`, `Card`, `Progress`), reflecting their relationships (e.g., cards and progress are linked to user and topic).
* **Interface Design:** Tailwind CSS is used for rapid styling. Main pages are `index.html` (login/registration) and `dashboard.html` (main application interface). Interface logic is implemented using vanilla JavaScript (`frontend/script.js`, `frontend/dashboard.js`, `frontend/src/generator.js`).
* **Implementation:** Backend is built on Express.js, MongoDB interaction through Mongoose. Frontend directly interacts with DOM and sends requests to backend API. Basic CI pipeline (`.github/workflows/ci.yml`) is configured for checking backend dependency installation.

## Unique Approaches or Methodologies

* **Frontend/Backend Separation:** Clear separation into two independent applications (`frontend` and `backend`) with API interaction. Each has its own dependencies and startup scripts.
* **Containerization:** Using Docker for backend ensures portability and simplifies deployment.

## Trade-offs

* **Frontend without framework:** Choosing vanilla JavaScript simplified initial development but may complicate maintenance and interface scaling with significant application complexity growth compared to using frameworks (React, Vue, Angular). State management and rendering are done manually.
* **No tests:** The project lacks automated tests (unit, integration, e2e). This speeds up initial development but increases regression risk when making changes and complicates refactoring. CI pipeline test steps are commented out.
* **Basic error handling:** Global error handler is implemented on backend (`backend/server.js`), but it hides error details in production. Frontend error handling and specific backend error handling can be improved for more informative feedback.
* **Basic CORS configuration:** Standard `cors()` configuration is used. For production environment, stricter configuration with specified allowed origins may be required.
* **Security:** Lack of explicit input validation on API endpoints (except what Mongoose may provide at schema level). Strict validation needs to be added for enhanced security.

## Known Issues or Problems / Potential Improvements

* **Improve error handling:** Make error handling more detailed both on backend (logging, possibly custom error classes) and frontend (displaying clear messages to users).
* **Input validation:** Add explicit validation for data coming to API (e.g., using `express-validator`).
* **Enhanced security:** Configure CORS more strictly, conduct security audit (e.g., dependency vulnerability check).
* **Linting:** Add and configure linter (e.g., ESLint) and formatter (Prettier) and include their checks in CI pipeline.
* **Frontend scalability:** With interface complexity growth, consider transitioning to lightweight framework or state management library.
* **Dockerfile optimization:** Dockerfile can be optimized to reduce image size and speed up build (e.g., multi-stage build).

IMPORTANT!!!
In the video I mentioned deploying the project on Google Cloud, but I ran out of money on the account, so I switched to render.com

https://youtu.be/7c1xzdytXss