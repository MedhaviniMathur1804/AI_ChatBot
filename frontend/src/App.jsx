import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState([])
  const [queryCount, setQueryCount] = useState(0)
  const [error, setError] = useState('')
  
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const finalTranscriptRef = useRef('')

  const speakText = useCallback((text) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      synthRef.current.speak(utterance)
    }
  }, [])

  const processQuery = useCallback(async (queryText) => {
    if (!queryText.trim()) return

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: queryText,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setQueryCount(prev => prev + 1)

    try {
      // Send query to backend
      const response = await fetch(`${API_BASE_URL}/api/process-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: queryText }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        text: data.response_text,
        sender: 'bot',
        intent: data.intent,
        action: data.action_taken,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])

      // Speak the response
      speakText(data.response_text)
    } catch (err) {
      console.error('Error processing query:', err)
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${err.message}. Please make sure the backend server is running.`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setError(err.message)
    }

    // Clear transcript
    setTranscript('')
  }, [speakText])

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError('')
        finalTranscriptRef.current = ''
      }

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          const finalText = finalTranscript.trim()
          finalTranscriptRef.current = finalText
          setTranscript(finalText)
        } else {
          setTranscript(interimTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        // Process the query if we have a final transcript
        if (finalTranscriptRef.current.trim()) {
          processQuery(finalTranscriptRef.current.trim())
        }
      }
    } else {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    } else {
      setError('Text-to-speech is not supported in this browser.')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [processQuery])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setError('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const handleButtonPress = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleButtonRelease = () => {
    if (isListening) {
      stopListening()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-indigo-600">Voice Bot</h1>
          <p className="text-gray-600 mt-1">Customer Interaction Assistant</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Analytics Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Queries</p>
              <p className="text-3xl font-bold text-indigo-600">{queryCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-2xl font-bold text-green-600">
                {isListening ? 'Listening...' : 'Ready'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Messages</p>
              <p className="text-3xl font-bold text-purple-600">{messages.length}</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversation</h2>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Press and hold the microphone button to start talking!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.intent && (
                      <p className="text-xs mt-1 opacity-75">
                        Intent: {message.intent} | {message.action}
                      </p>
                    )}
                    <p className="text-xs mt-1 opacity-60">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">You said:</span> {transcript}
            </p>
          </div>
        )}

        {/* Microphone Button */}
        <div className="flex justify-center">
          <button
            onMouseDown={handleButtonPress}
            onMouseUp={handleButtonRelease}
            onTouchStart={handleButtonPress}
            onTouchEnd={handleButtonRelease}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white focus:outline-none focus:ring-4 focus:ring-indigo-300`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <svg
                className="w-16 h-16"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM5 9a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm9-1a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-16 h-16"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p className="mb-2">
            <strong>How to use:</strong> Press and hold the microphone button, speak your question, then release.
          </p>
          <p className="text-xs">
            Try asking: "What's my account balance?", "What are your business hours?", "How can I contact support?"
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 px-6 mt-8">
        <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
          <p>Voice Bot Customer Interaction System &copy; 2024</p>
        </div>
      </footer>
    </div>
  )
}

export default App

