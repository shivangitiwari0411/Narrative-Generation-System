#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    exit
}

trap cleanup SIGINT

echo "Starting FastAPI Backend..."
source venv/bin/activate
uvicorn api.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "Starting React Frontend..."
cd web
npm run dev

# Wait for background process
wait $BACKEND_PID
