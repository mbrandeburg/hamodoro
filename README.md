# 🏔️ Hamodoro Timer 🏔️

A Ham-themed Pomodoro timer webapp named after our beloved Bernese Mountain Dog Ham! Stay focused like Ham stays focused on Swiss cheese treats.

## Features

- 🎯 **Focus Sessions**: 25-minute focused work periods
- ☕ **Break Time**: 5-minute rest periods  
- 🏔️ **Ham Motivation**: Ham's expressions change based on focus/break mode
- � **Ham Quotes**: Motivational messages from Ham the Bernese Mountain Dog
- 📊 **Session Tracking**: Keep track of completed sessions
- 🔔 **Notifications**: Get notified when sessions complete
- ✅ **Todo List**: Add and track tasks that Ham will watch over
- 🎨 **Ham-themed UI**: Beautiful, playful design inspired by our Bernese Mountain Dog friend

## Quick Start

### Using UV (Recommended)

1. **Install UV** (if you haven't already):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Run the local launcher**:
   ```bash
   ./run_hamodoro.sh
   ```

   This will automatically:
   - Install dependencies
   - Start the Flask development server
   - Open your browser to http://localhost:9055

### Manual Setup

1. **Install dependencies**:
   ```bash
   uv sync
   ```

2. **Run the application**:
   ```bash
   uv run python app.py
   ```

3. **Open your browser** to: http://localhost:9055

## Docker Deployment

### Build and Run

```bash
# Build the Docker image
docker build -t hamodoro .

# Run the container
docker run -p 9055:9055 hamodoro
```

### Docker Compose (Alternative)

```bash
docker-compose up --build
```

## Project Structure

```
hamodoro/
├── app.py                 # Flask backend
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── style.css         # Ham-themed styling
│   ├── script.js         # Frontend JavaScript
│   └── images/           # Ham placeholder images
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── pyproject.toml        # Python project configuration
├── run_hamodoro.sh       # Local launcher script
└── README.md            # This file
```

## Customization

### Replace Ham Images

The app currently uses placeholder images. Replace these files with your actual Ham photos:

- `static/images/ham-focus.png` - Ham looking focused/serious (for work time)
- `static/images/ham-happy.png` - Ham looking happy/playful (for break time)

**Recommended image specifications:**

- Size: 150x150 pixels
- Format: PNG or JPG
- Style: Clear, well-lit photos of Ham

### Timer Settings

Edit `app.py` to customize timer durations:

```python
timer_state = {
    'duration': 25 * 60,        # Focus time (25 minutes)
    'break_duration': 5 * 60,   # Break time (5 minutes)
    # ... other settings
}
```

### Ham Messages

Add your own Ham-inspired messages in `static/script.js`:

```javascript
const focusMessages = [
    "Your custom Ham the Bernese message here! 🏔️",
    // ... add more messages
];
```

### Todo List Features

The integrated todo list helps you track tasks while working:

- **Add tasks**: Type in the input field and press Enter or click "ADD"
- **Mark complete**: Click the circle checkbox to mark tasks as done
- **Delete tasks**: Click the "×" button to remove tasks
- **Task persistence**: Tasks are stored in memory during your session
- **Statistics**: See completed vs remaining task counts

Ham the Bernese Mountain Dog will watch over your tasks and keep you motivated to complete them!

## Development

### Install Development Dependencies

```bash
uv sync --group dev
```

### Code Formatting

```bash
uv run black .
```

### Linting

```bash
uv run flake8 .
```

## API Endpoints

The app provides a simple REST API:

- `GET /` - Main application page
- `POST /api/start` - Start the timer
- `POST /api/stop` - Stop the timer
- `POST /api/reset` - Reset the timer
- `POST /api/toggle_break` - Switch between focus/break mode
- `GET /api/status` - Get current timer status
- `GET /api/todos` - Get all todo items
- `POST /api/todos` - Add a new todo item
- `PUT /api/todos/<id>` - Update a todo item (mark as completed/incomplete)
- `DELETE /api/todos/<id>` - Delete a todo item

## Browser Support

- Modern browsers with JavaScript enabled
- Notification API support (optional, for completion alerts)
- SVG support for Ham images

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Feel free to use it, modify it, and share it!

## Dedication

This app is dedicated to Ham, the goodest Bernese Mountain Dog who keeps us motivated and reminds us that sometimes the best focus comes from knowing there's a treat (or break) waiting at the end! 🏔️�

---

*"Stay focused like Ham the Bernese stays focused on alpine trails!" - The Hamodoro Philosophy*
