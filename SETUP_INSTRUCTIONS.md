# Flashcards Master Setup Instructions

## 🚨 IMPORTANT: Environment Variables Setup

For the application to work correctly, you need to create a `.env` file in the `backend/` folder with the following variables:

### 1. Create `backend/.env` file

```bash
# MongoDB database configuration
MONGODB_URI=mongodb://localhost:27017/flashcards
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/flashcards

# Server port
PORT=8080

# JWT secret key (change to your own!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Environment
NODE_ENV=development
```

### 2. MongoDB Setup

**Local installation:**
- Download and install MongoDB Community Edition
- Start MongoDB service
- Use URI: `mongodb://localhost:27017/flashcards`

**Or use MongoDB Atlas (cloud solution):**
1. Register at https://cloud.mongodb.com/
2. Create a free cluster
3. Get connection string
4. Replace `MONGODB_URI` with your connection string

## 🚀 Project Launch

### Backend Launch (Port 8080)
```bash
cd backend
npm install
npm start
# or for development: npm run dev
```

### Frontend Launch (Port 3000)
```bash
cd frontend  
npm install
npm start
```

## 🔧 Troubleshooting

### Error 500 in `/api/generate`

### Error 405 Method Not Allowed
- ✅ **RESOLVED**: Backend running on port 8080
- ✅ **RESOLVED**: Frontend configured for requests to `http://localhost:8080/api`

### CORS errors
- Backend configured to accept requests from frontend
- Ensure both servers are running

## 📝 Port Structure

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MongoDB**: localhost:27017 (default)

## 🔐 Security

⚠️ **NEVER COMMIT `.env` file to git!**

The `.env` file is already added to `.gitignore`, but make sure your secret keys remain private.

## 🎯 First Steps After Setup

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start` 
3. Open http://localhost:3000 in browser
4. Register or log in
5. Create a topic and try adding cards!

## 🆘 If Something Doesn't Work

1. Check browser console for JavaScript errors
2. Check backend terminal for server errors
3. Ensure all variables in `.env` are filled correctly
4. Restart both servers