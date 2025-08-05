class HamodoroTimer {
    constructor() {
        this.isRunning = false;
        this.isBreak = false;
        this.sessionsCompleted = 0;
        this.updateInterval = null;
        this.messageChangeInterval = null;
        this.lastMessageChange = 0;
        this.MESSAGE_CHANGE_DELAY = 10000; // Change message every 10 seconds
        this.todos = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateStatus();
        this.loadTodos();
        
        // Update every second
        setInterval(() => this.updateStatus(), 1000);
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timer');
        this.modeDisplay = document.getElementById('mode');
        this.hamImage = document.getElementById('ham-image');
        this.hamMessage = document.getElementById('ham-message');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.breakBtn = document.getElementById('break-btn');
        this.sessionsDisplay = document.getElementById('sessions');
        this.container = document.querySelector('.timer-container');
        
        // Todo elements
        this.todoInput = document.getElementById('todo-input');
        this.addTodoBtn = document.getElementById('add-todo-btn');
        this.todoList = document.getElementById('todo-list');
        this.completedCount = document.getElementById('completed-count');
        this.remainingCount = document.getElementById('remaining-count');
    }
    
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.breakBtn.addEventListener('click', () => this.toggleBreak());
        
        // Todo event listeners
        this.addTodoBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }
    
    async startTimer() {
        try {
            const response = await fetch('/api/start', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });
            const data = await response.json();
            this.updateUI();
        } catch (error) {
            console.error('Error starting timer:', error);
        }
    }
    
    async stopTimer() {
        try {
            const response = await fetch('/api/stop', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });
            const data = await response.json();
            this.updateUI();
        } catch (error) {
            console.error('Error stopping timer:', error);
        }
    }
    
    async resetTimer() {
        try {
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });
            const data = await response.json();
            this.updateUI();
        } catch (error) {
            console.error('Error resetting timer:', error);
        }
    }
    
    async toggleBreak() {
        try {
            const response = await fetch('/api/toggle_break', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });
            const data = await response.json();
            this.updateUI();
        } catch (error) {
            console.error('Error toggling break:', error);
        }
    }
    
    async updateStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            this.updateTimerDisplay(data);
            this.updateUI(data);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }
    
    updateTimerDisplay(data) {
        const remaining = data.remaining || data.current_duration;
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update mode display
        if (data.is_break) {
            this.modeDisplay.textContent = 'BREAK TIME �';
            this.container.className = 'timer-container break-mode';
        } else {
            this.modeDisplay.textContent = 'FOCUS TIME �️';
            this.container.className = 'timer-container focus-mode';
        }
        
        // Update Ham's appearance and message
        this.updateHamState(data);
        
        // Check if session completed
        if (remaining <= 0 && !data.is_running) {
            if (!data.is_break) {
                this.sessionsCompleted++;
                this.sessionsDisplay.textContent = this.sessionsCompleted;
                this.celebrateCompletion();
            }
        }
    }
    
    updateHamState(data) {
        const now = Date.now();
        
        if (data.is_break) {
            // Happy Ham - break time
            this.hamImage.src = '/static/images/ham-happy.png';
            this.hamImage.alt = 'Happy Ham';
            
            // Only change message if enough time has passed
            if (now - this.lastMessageChange > this.MESSAGE_CHANGE_DELAY) {
                const happyMessages = [
                    "Great job! Time for Swiss cheese treats! 💪",
                    "You did amazing! Let's play in the snow! ❄️",
                    "Break time = cheese and belly rubs! 💪",
                    "Woof! You deserve this alpine break! 🏔️",
                    "Time to stretch those mountain dog legs! 🥾"
                ];
                this.hamMessage.textContent = happyMessages[Math.floor(Math.random() * happyMessages.length)];
                this.lastMessageChange = now;
            }
        } else {
            // Focused Ham - work time
            this.hamImage.src = '/static/images/ham-focus.png';
            this.hamImage.alt = 'Focused Ham';
            
            // Only change message if enough time has passed
            if (now - this.lastMessageChange > this.MESSAGE_CHANGE_DELAY) {
                const focusMessages = [
                    "Let's focus together, mountain style! 🏔️",
                    "I'm watching you work with my gentle eyes! 👀",
                    "Stay strong, Swiss cheese treats await! 🏔️",
                    "Focus like I focus on alpine hiking trails! 🥾",
                    "You got this, my favorite human! 💪"
                ];
                this.hamMessage.textContent = focusMessages[Math.floor(Math.random() * focusMessages.length)];
                this.lastMessageChange = now;
            }
        }
    }
    
    updateUI(data = null) {
        if (data) {
            this.isRunning = data.is_running;
            this.isBreak = data.is_break;
        }
        
        // Update button states
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;
        
        // Update break button text
        this.breakBtn.textContent = this.isBreak ? '🎯 FOCUS MODE' : '☕ BREAK MODE';
    }
    
    celebrateCompletion() {
        // Add a celebration animation
        this.hamImage.style.animation = 'bounce 1s ease-in-out 3';
        
        // Play a notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Hamodoro Complete!', {
                body: 'Ham the Bernese is proud of you! Time for a break! 🏔️',
                icon: '/static/images/ham-happy.png'
            });
        }
        
        setTimeout(() => {
            this.hamImage.style.animation = '';
        }, 3000);
    }
    
    // Todo List Methods
    async loadTodos() {
        try {
            const response = await fetch('/api/todos');
            const todos = await response.json();
            this.todos = todos;
            this.renderTodos();
        } catch (error) {
            console.error('Error loading todos:', error);
        }
    }
    
    async addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;
        
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: text})
            });
            
            if (response.ok) {
                const newTodo = await response.json();
                this.todos.push(newTodo);
                this.todoInput.value = '';
                this.renderTodos();
            }
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    }
    
    async toggleTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) return;
        
        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({completed: !todo.completed})
            });
            
            if (response.ok) {
                todo.completed = !todo.completed;
                this.renderTodos();
            }
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    }
    
    async deleteTodo(todoId) {
        try {
            const response = await fetch(`/api/todos/${todoId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.todos = this.todos.filter(t => t.id !== todoId);
                this.renderTodos();
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }
    
    renderTodos() {
        const completedTodos = this.todos.filter(t => t.completed).length;
        const remainingTodos = this.todos.length - completedTodos;
        
        this.completedCount.textContent = completedTodos;
        this.remainingCount.textContent = remainingTodos;
        
        if (this.todos.length === 0) {
            this.todoList.innerHTML = '<div class="todo-empty">Ham the Bernese is waiting for your first task! 🏔️</div>';
            return;
        }
        
        this.todoList.innerHTML = this.todos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="hamodoroTimer.toggleTodo(${todo.id})"></div>
                <div class="todo-text ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</div>
                <button class="todo-delete" onclick="hamodoroTimer.deleteTodo(${todo.id})" title="Delete task">
                    ×
                </button>
            </div>
        `).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add bounce animation
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-20px);
        }
        80% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize the timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.hamodoroTimer = new HamodoroTimer();
});
