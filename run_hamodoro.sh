#!/bin/bash

# 🐕 Hamodoro Local Launcher Script 🐕
# This script uses UV to manage dependencies and run the Hamodoro timer

set -e  # Exit on any error

echo "🐕 Starting Hamodoro Timer 🐕"
echo "==============================="

# Check if uv is installed
if command -v uv &> /dev/null; then
    echo "📦 Installing dependencies with UV..."
    uv pip install -r requirements.txt
    echo "🚀 Starting Flask development server with UV..."
    uv run python app.py
else
    echo "⚠️  UV not found. Falling back to pip..."
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "📦 Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    echo "📦 Installing dependencies with pip..."
    pip install -r requirements.txt
    
    echo "🚀 Starting Flask development server..."
    python app.py
fi

echo "🌐 Ham will be available at: http://localhost:9055"
echo "📱 Press Ctrl+C to stop the server"
