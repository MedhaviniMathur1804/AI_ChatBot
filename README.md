# Voice Bot for Customer Interaction

A complete, working prototype of a Voice Bot system with React frontend and FastAPI backend, featuring browser-native speech recognition and text-to-speech capabilities.

## Features

- 🎤 **Speech-to-Text (STT)**: Uses browser's native Web Speech API
- 🔊 **Text-to-Speech (TTS)**: Uses browser's native Speech Synthesis API
- 🤖 **Natural Language Understanding**: Rule-based intent detection in Python backend
- 💾 **SQLite Database**: Stores FAQs and user account data
- 📊 **Analytics Dashboard**: Real-time query count and conversation tracking
- 🎨 **Modern UI**: Built with React, Vite, and Tailwind CSS

## Project Structure

```
AI_Chatbot/
├── backend/
│   ├── main.py           # FastAPI application with API endpoints
│   ├── database.py       # SQLite database models and initialization
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── main.jsx      # React entry point
│   │   └── index.css    # Tailwind CSS imports
│   ├── index.html        # HTML template
│   ├── package.json      # Node.js dependencies
│   ├── vite.config.js    # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── postcss.config.js # PostCSS configuration
└── README.md
```

## Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and **npm** installed
- A modern browser with Web Speech API support (Chrome, Edge, or Safari)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell):**
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD):**
     ```bash
     venv\Scripts\activate.bat
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## How to Use

1. Make sure both backend and frontend servers are running
2. Open your browser and navigate to `http://localhost:5173`
3. **Press and hold** the large microphone button
4. Speak your question clearly (e.g., "What's my account balance?")
5. Release the button when finished speaking
6. The bot will process your query and respond both in text and voice

## Example Queries

Try asking:
- "What's my account balance?"
- "What are your business hours?"
- "How can I contact support?"
- "What is your pricing?"
- "What payment methods do you accept?"
- "How do I reset my password?"

## API Endpoints

### POST `/api/process-query`
Processes a user query and returns a response.

**Request Body:**
```json
{
  "text": "What's my account balance?"
}
```

**Response:**
```json
{
  "response_text": "Your account balance for demo_user (Account: ACC003) is $500.00.",
  "intent": "check_balance",
  "action_taken": "Retrieved account balance from database"
}
```

### GET `/api/stats`
Returns basic statistics about the database.

## Database

The SQLite database (`voicebot.db`) is automatically created in the backend directory on first run. It includes:

- **FAQs**: Pre-populated frequently asked questions
- **User Accounts**: Sample user accounts with balances

## Browser Compatibility

- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ⚠️ Firefox (limited support for Web Speech API)

## Troubleshooting

### Backend Issues

- **Port 8000 already in use**: Change the port in the uvicorn command or kill the process using port 8000
- **Database errors**: Delete `voicebot.db` and restart the server to recreate it

### Frontend Issues

- **CORS errors**: Make sure the backend is running and CORS is properly configured
- **Speech recognition not working**: 
  - Ensure you're using Chrome, Edge, or Safari
  - Check browser permissions for microphone access
  - Make sure you're using HTTPS or localhost (required for Web Speech API)

### Common Issues

- **"Speech recognition is not supported"**: Use a supported browser (Chrome, Edge, or Safari)
- **"Backend server is not running"**: Start the backend server first
- **Microphone not working**: Check browser permissions and allow microphone access

## Development

### Backend Development
- The backend uses FastAPI with automatic API documentation
- Visit `http://localhost:8000/docs` for interactive API documentation
- Database models are defined in `database.py`
- Intent detection logic is in `main.py`

### Frontend Development
- Built with React 18 and Vite for fast development
- Tailwind CSS for styling
- State management handled with React hooks

## License

This project is provided as-is for demonstration purposes.

