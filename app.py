from flask import Flask, render_template, jsonify, request
from datetime import datetime, timedelta
import json

app = Flask(__name__)

# Global timer state
timer_state = {
    'is_running': False,
    'is_break': False,
    'start_time': None,
    'duration': 25 * 60,  # 25 minutes in seconds
    'break_duration': 5 * 60,  # 5 minutes in seconds
    'current_duration': 25 * 60
}

# Global todo list
todo_list = []
todo_id_counter = 1

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
    return jsonify(todo_list)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    global todo_id_counter
    data = request.get_json()
    text = data.get('text', '').strip()
    
    if not text:
        return jsonify({'error': 'Todo text is required'}), 400
    
    todo = {
        'id': todo_id_counter,
        'text': text,
        'completed': False,
        'created_at': datetime.now().isoformat()
    }
    
    todo_list.append(todo)
    todo_id_counter += 1
    
    return jsonify(todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()
    
    for todo in todo_list:
        if todo['id'] == todo_id:
            if 'completed' in data:
                todo['completed'] = bool(data['completed'])
            if 'text' in data:
                todo['text'] = data['text'].strip()
            return jsonify(todo)
    
    return jsonify({'error': 'Todo not found'}), 404

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    global todo_list
    todo_list = [todo for todo in todo_list if todo['id'] != todo_id]
    return '', 204

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9055, debug=True)
