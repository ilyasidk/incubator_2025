# Flashcards Master

A web application for studying flashcards by topic, tracking progress, and generating new cards using AI.

## Description

Flashcards Master is a learning tool that allows users to study using digital flashcards. The application features:

- User authentication for personalized learning
- Topic-based organization of flashcards
- Interactive card flipping with "I Know This" / "Still Learning" tracking
- Progress visualization for each topic
- AI-powered flashcard generation using Gemini

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript with Tailwind CSS
- **Backend:** Node.js with Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **AI Integration:** Google's Gemini API

### Why This Stack?

- **Node.js & Express:** Lightweight, fast, and perfect for building RESTful APIs with JavaScript.
- **MongoDB:** Flexible schema design is ideal for the document-based nature of flashcards and user progress.
- **Tailwind CSS:** Enables rapid UI development with utility classes, resulting in a clean, responsive design.
- **JWT Authentication:** Provides secure, stateless authentication without requiring server-side sessions.
- **Gemini API:** Powers the AI flashcard generation feature with high-quality, contextually relevant content.

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Gemini API key

### Backend Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/flashcards-master.git
cd flashcards-master
```

2. Install backend dependencies:
```
cd backend
npm install
```

3. Create a `.env` file in the backend directory:
```
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

4. Start the backend:
```
npm run dev
```

### Frontend Setup

1. Install frontend dependencies:
```
cd ../frontend
npm install
```

2. Start the frontend:
```
npm start
```

The application will be accessible at `http://localhost:3000`.

## Development Process

1. **Planning & Architecture**: Designed the data model and API endpoints.
2. **Backend Development**: Implemented authentication, flashcard management, and AI integration.
3. **Frontend Development**: Created the UI with login/register forms, flashcard viewer, and progress tracking.
4. **Integration**: Connected frontend and backend, tested end-to-end functionality.
5. **Deployment**: Prepared the application for deployment.

## Unique Approaches

- **Card Flipping Animation**: Enhanced the learning experience with smooth CSS 3D transforms.
- **AI Integration**: Used Gemini to generate high-quality flashcards on any topic.
- **Progress Tracking**: Implemented a dual-metric system tracking both known cards and total attempts.
- **Responsive Design**: Mobile-first approach ensures usability across devices.

## Design Compromises

- **Simplified Authentication**: Basic email/password authentication was chosen over more complex OAuth for simplicity.
- **Client-Side Rendering**: Used vanilla JavaScript instead of a framework like React to reduce complexity.
- **Limited Card Editing**: Focused on card consumption rather than extensive editing capabilities.
- **Local Development**: Prioritized local development setup over complex deployment configurations.

## Known Issues

- Card generation may take longer for complex topics.
- The application relies on browser localStorage for token storage, which has security limitations.
- No password reset functionality is implemented.

## Future Enhancements

- Implement spaced repetition algorithm for optimized learning.
- Add card sharing and export features.
- Improve mobile experience with touch-specific interactions.
- Add more detailed analytics and learning statistics.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 