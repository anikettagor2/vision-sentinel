#!/bin/bash

echo "========================================"
echo "Face Recognition Attendance System Setup"
echo "========================================"
echo

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "Node.js found:"
node --version

# Check if Python is installed
echo
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python from https://python.org/"
    exit 1
fi
echo "Python found:"
python3 --version

# Install frontend dependencies
echo
echo "Installing frontend dependencies..."
cd developer
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
echo "Frontend dependencies installed successfully!"

# Install backend dependencies
echo
echo "Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
echo "Backend dependencies installed successfully!"

# Create start script
echo
echo "Creating start script..."
cd ..
cat > start.sh << 'EOF'
#!/bin/bash
echo "Starting Face Recognition Attendance System..."
echo

echo "Starting backend server..."
cd developer/backend
python3 main.py &
BACKEND_PID=$!
cd ../..

echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend development server..."
cd developer
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Both servers are starting..."
echo "Frontend will be available at: http://localhost:5173"
echo "Backend will be available at: http://localhost:8000"
echo

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "All servers stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
echo "Press Ctrl+C to stop all servers"
wait
EOF

chmod +x start.sh

# Create stop script
echo "Creating stop script..."
cat > stop.sh << 'EOF'
#!/bin/bash
echo "Stopping Face Recognition Attendance System..."
echo

# Kill Node.js processes
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Kill Python processes
pkill -f "python3 main.py" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null

echo "All servers stopped."
EOF

chmod +x stop.sh

echo
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo
echo "To start the application:"
echo "  - Run: ./start.sh"
echo
echo "To stop the application:"
echo "  - Run: ./stop.sh"
echo
echo "The application will be available at:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend: http://localhost:8000"
echo 