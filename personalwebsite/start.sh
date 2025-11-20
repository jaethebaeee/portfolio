#!/bin/bash

# 3D Voxel Personal Website - Quick Start Script
# Frontend-only interactive portfolio with AI chat

set -e  # Exit on error

echo "🎮 3D Voxel Personal Website - Quick Start"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Check if dependencies are installed
echo "📦 Checking dependencies..."

if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "🚀 Starting the website..."
echo ""

# Start frontend
if check_port 5173; then
    echo "⚠️  Port 5173 is already in use. Skipping frontend start."
else
    echo "🎨 Starting frontend on port 5173..."
    cd frontend
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
    echo "📋 Frontend logs: frontend.log"

    # Wait for frontend to be ready
    echo "⏳ Waiting for frontend to be ready..."
    sleep 5
fi

echo ""
echo "✨ Website started successfully!"
echo ""
echo "🌐 Open your browser and visit:"
echo "   👉 http://localhost:5173"
echo ""
echo "🎮 Controls:"
echo "   • WASD or Arrow Keys - Move"
echo "   • E or Space - Interact with zones"
echo "   • ESC - Close overlays"
echo "   • Tab - View achievements"
echo ""
echo "📊 Service Status:"
echo "   • Website: http://localhost:5173"
echo ""
echo "📝 Logs:"
echo "   • Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop:"
echo "   • Press Ctrl+C or run: pkill -f 'npm run dev'"
echo ""
echo "Enjoy your 3D voxel portfolio! 🎉"