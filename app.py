from flask import Flask, render_template, jsonify, request
from datetime import datetime, timedelta
import json
import sqlite3
import os

app = Flask(__name__)

# Database setup
DATABASE = os.environ.get('DATABASE', 'hamodoro.db')

def init_db():
    """Initialize the database with todos table"""
    conn = sqlite3.connect(DATABASE)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    """Get a database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Global timer state
timer_state = {
    'is_running': False,
    'is_break': False,
    'start_time': None,
    'duration': 25 * 60,  # 25 minutes in seconds
    'break_duration': 5 * 60,  # 5 minutes in seconds
    'current_duration': 25 * 60
}

# Initialize database on startup
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/start', methods=['POST'])
def start_timer():
    global timer_state
    timer_state['is_running'] = True
    timer_state['start_time'] = datetime.now().isoformat()
    return jsonify({'status': 'started', 'state': timer_state})

@app.route('/api/stop', methods=['POST'])
def stop_timer():
    global timer_state
    timer_state['is_running'] = False
    timer_state['start_time'] = None
    return jsonify({'status': 'stopped', 'state': timer_state})

@app.route('/api/reset', methods=['POST'])
def reset_timer():
    global timer_state
    timer_state['is_running'] = False
    timer_state['is_break'] = False
    timer_state['start_time'] = None
    timer_state['current_duration'] = timer_state['duration']
    return jsonify({'status': 'reset', 'state': timer_state})

@app.route('/api/toggle_break', methods=['POST'])
def toggle_break():
    global timer_state
    timer_state['is_break'] = not timer_state['is_break']
    timer_state['current_duration'] = timer_state['break_duration'] if timer_state['is_break'] else timer_state['duration']
    timer_state['is_running'] = False
    timer_state['start_time'] = None
    return jsonify({'status': 'toggled', 'state': timer_state})

@app.route('/api/status')
def get_status():
    global timer_state
    current_state = timer_state.copy()
    
    if timer_state['is_running'] and timer_state['start_time']:
        start_time = datetime.fromisoformat(timer_state['start_time'])
        elapsed = (datetime.now() - start_time).total_seconds()
        remaining = max(0, timer_state['current_duration'] - elapsed)
        current_state['remaining'] = remaining
        
        # Auto-transition when timer ends
        if remaining <= 0:
            timer_state['is_running'] = False
            timer_state['is_break'] = not timer_state['is_break']
            timer_state['current_duration'] = timer_state['break_duration'] if timer_state['is_break'] else timer_state['duration']
            timer_state['start_time'] = None
            current_state = timer_state.copy()
            current_state['remaining'] = timer_state['current_duration']
    else:
        current_state['remaining'] = timer_state['current_duration']
    
    return jsonify(current_state)

@app.route('/api/todos', methods=['GET'])
def get_todos():
    conn = get_db_connection()
    todos = conn.execute(
        'SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC'
    ).fetchall()
    conn.close()
    
    # Convert to list of dictionaries
    todos_list = []
    for todo in todos:
        todos_list.append({
            'id': todo['id'],
            'text': todo['text'],
            'completed': bool(todo['completed']),
            'created_at': todo['created_at']
        })
    
    return jsonify(todos_list)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    text = data.get('text', '').strip()
    
    if not text:
        return jsonify({'error': 'Todo text is required'}), 400
    
    conn = get_db_connection()
    cursor = conn.execute(
        'INSERT INTO todos (text, completed) VALUES (?, ?)',
        (text, False)
    )
    todo_id = cursor.lastrowid
    
    # Get the created todo
    todo = conn.execute(
        'SELECT id, text, completed, created_at FROM todos WHERE id = ?',
        (todo_id,)
    ).fetchone()
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': todo['id'],
        'text': todo['text'],
        'completed': bool(todo['completed']),
        'created_at': todo['created_at']
    }), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()
    
    conn = get_db_connection()
    
    # Check if todo exists
    todo = conn.execute(
        'SELECT id FROM todos WHERE id = ?', (todo_id,)
    ).fetchone()
    
    if not todo:
        conn.close()
        return jsonify({'error': 'Todo not found'}), 404
    
    # Update the todo
    if 'completed' in data:
        conn.execute(
            'UPDATE todos SET completed = ? WHERE id = ?',
            (bool(data['completed']), todo_id)
        )
    if 'text' in data:
        conn.execute(
            'UPDATE todos SET text = ? WHERE id = ?',
            (data['text'].strip(), todo_id)
        )
    
    # Get the updated todo
    updated_todo = conn.execute(
        'SELECT id, text, completed, created_at FROM todos WHERE id = ?',
        (todo_id,)
    ).fetchone()
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': updated_todo['id'],
        'text': updated_todo['text'],
        'completed': bool(updated_todo['completed']),
        'created_at': updated_todo['created_at']
    })

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    conn = get_db_connection()
    
    # Check if todo exists and delete it
    result = conn.execute(
        'DELETE FROM todos WHERE id = ?', (todo_id,)
    )
    
    conn.commit()
    conn.close()
    
    if result.rowcount == 0:
        return jsonify({'error': 'Todo not found'}), 404
    
    return '', 204

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9055, debug=True)
