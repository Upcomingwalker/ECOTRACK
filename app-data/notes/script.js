// Data Storage (In-memory since localStorage is not available)
let appData = {
    notes: [],
    todos: [],
    currentTheme: 'light',
    currentTab: 'notes',
    editingNoteId: null,
    editingTodoId: null
};

// Category configurations
const todoCategories = {
    personal: { icon: '🏠', name: 'Personal', color: '#81C784' },
    work: { icon: '💼', name: 'Work', color: '#9CAF88' },
    eco: { icon: '🌱', name: 'Eco-Friendly', color: '#2E7D32' },
    health: { icon: '💚', name: 'Health', color: '#66BB6A' }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadSampleData();
    initializeApp();
    bindEventListeners();
    updateUI();
});

function initializeApp() {
    // Set initial theme
    const savedTheme = appData.currentTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function loadSampleData() {
    // Sample notes
    appData.notes = [
        {
            id: generateId(),
            title: 'Welcome to EcoNotes! 🌱',
            content: 'This is your first eco-friendly note! EcoNotes helps you stay organized while being environmentally conscious. You can create, edit, and delete notes seamlessly.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: generateId(),
            title: 'Sustainable Living Tips',
            content: 'Some ideas for sustainable living:\n\n• Use reusable bags when shopping\n• Reduce plastic consumption\n• Choose renewable energy sources\n• Start composting\n• Buy local and organic products',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
    
    // Sample todos
    appData.todos = [
        {
            id: generateId(),
            title: 'Switch to renewable energy provider',
            completed: false,
            category: 'eco',
            dueDate: '',
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            title: 'Complete quarterly report',
            completed: false,
            category: 'work',
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: generateId(),
            title: 'Buy reusable water bottles',
            completed: true,
            category: 'eco',
            dueDate: '',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

function bindEventListeners() {
    // Tab switching
    const notesTab = document.getElementById('notesTab');
    const todosTab = document.getElementById('todosTab');
    
    if (notesTab) notesTab.addEventListener('click', () => switchTab('notes'));
    if (todosTab) todosTab.addEventListener('click', () => switchTab('todos'));
    
    // Add button
    const addBtn = document.getElementById('addBtn');
    if (addBtn) addBtn.addEventListener('click', handleAddClick);
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    
    // Modal close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Modal form submissions
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const saveTodoBtn = document.getElementById('saveTodoBtn');
    
    if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveNote);
    if (saveTodoBtn) saveTodoBtn.addEventListener('click', saveTodo);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    appData.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.getElementById(tabName + 'Tab');
    if (activeTab) activeTab.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    const activeSection = document.getElementById(tabName + 'Section');
    if (activeSection) activeSection.classList.add('active');
    
    // Update add button text
    const addText = document.querySelector('.add-text');
    if (addText) {
        addText.textContent = tabName === 'notes' ? 'Add Note' : 'Add Todo';
    }
    
    // Clear search when switching tabs
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    updateUI();
}

function handleAddClick(e) {
    e.preventDefault();
    console.log('Add button clicked for tab:', appData.currentTab);
    
    if (appData.currentTab === 'notes') {
        showNoteModal();
    } else {
        showTodoModal();
    }
}

function toggleTheme() {
    console.log('Theme toggle clicked');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log('Switching from', currentTheme, 'to', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    appData.currentTheme = newTheme;
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching for:', searchTerm);
    
    if (appData.currentTab === 'notes') {
        renderNotes(searchTerm);
    } else {
        renderTodos(searchTerm);
    }
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'n':
                e.preventDefault();
                handleAddClick(e);
                break;
            case 'f':
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
                break;
        }
    }
}

// Notes functionality
function showNoteModal(noteId = null) {
    console.log('Showing note modal for ID:', noteId);
    const modal = document.getElementById('noteModal');
    const title = document.getElementById('noteModalTitle');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    
    if (!modal || !title || !noteTitle || !noteContent) {
        console.error('Note modal elements not found');
        return;
    }
    
    appData.editingNoteId = noteId;
    
    if (noteId) {
        const note = appData.notes.find(n => n.id === noteId);
        if (note) {
            title.textContent = 'Edit Note';
            noteTitle.value = note.title;
            noteContent.value = note.content;
        }
    } else {
        title.textContent = 'Create New Note';
        noteTitle.value = '';
        noteContent.value = '';
    }
    
    openModal('noteModal');
    setTimeout(() => noteTitle.focus(), 100);
}

function saveNote() {
    console.log('Saving note');
    const title = document.getElementById('noteTitle')?.value?.trim();
    const content = document.getElementById('noteContent')?.value?.trim();
    
    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }
    
    const now = new Date().toISOString();
    
    if (appData.editingNoteId) {
        // Edit existing note
        const noteIndex = appData.notes.findIndex(n => n.id === appData.editingNoteId);
        if (noteIndex >= 0) {
            appData.notes[noteIndex] = {
                ...appData.notes[noteIndex],
                title,
                content,
                updatedAt: now
            };
        }
    } else {
        // Create new note
        const newNote = {
            id: generateId(),
            title,
            content,
            createdAt: now,
            updatedAt: now
        };
        appData.notes.unshift(newNote);
    }
    
    closeModal('noteModal');
    updateUI();
    showNotification(appData.editingNoteId ? 'Note updated successfully!' : 'Note created successfully!');
}

function editNote(noteId) {
    console.log('Editing note:', noteId);
    showNoteModal(noteId);
}

function deleteNote(noteId) {
    console.log('Deleting note:', noteId);
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
        appData.notes = appData.notes.filter(n => n.id !== noteId);
        updateUI();
        showNotification('Note deleted successfully!');
    }
}

function renderNotes(searchTerm = '') {
    console.log('Rendering notes with search term:', searchTerm);
    const notesGrid = document.getElementById('notesGrid');
    const notesEmpty = document.getElementById('notesEmpty');
    
    if (!notesGrid || !notesEmpty) {
        console.error('Notes elements not found');
        return;
    }
    
    let filteredNotes = appData.notes;
    
    if (searchTerm) {
        filteredNotes = appData.notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredNotes.length === 0) {
        notesGrid.style.display = 'none';
        notesEmpty.style.display = 'block';
        
        if (searchTerm) {
            notesEmpty.innerHTML = `
                <div class="empty-icon">🔍</div>
                <h3>No notes found</h3>
                <p>No notes match your search for "${searchTerm}". Try different keywords.</p>
            `;
        } else {
            notesEmpty.innerHTML = `
                <div class="empty-icon">🌿</div>
                <h3>Start your sustainable note-taking journey</h3>
                <p>Create your first note and help save the planet by going paperless!</p>
                <button class="btn btn--primary" onclick="showNoteModal()">Create First Note</button>
            `;
        }
        return;
    }
    
    notesEmpty.style.display = 'none';
    notesGrid.style.display = 'grid';
    
    notesGrid.innerHTML = filteredNotes.map(note => `
        <div class="note-card fade-in" onclick="editNote('${note.id}')">
            <div class="note-header">
                <h3 class="note-title">${escapeHtml(note.title)}</h3>
                <div class="note-actions">
                    <button class="note-btn" onclick="event.stopPropagation(); editNote('${note.id}')" title="Edit">✏️</button>
                    <button class="note-btn delete" onclick="event.stopPropagation(); deleteNote('${note.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="note-content">${escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
            <div class="note-footer">
                <div class="note-date">
                    <span>📅</span>
                    <span>${formatDate(note.updatedAt)}</span>
                </div>
                <div class="note-status">
                    ${note.createdAt !== note.updatedAt ? '✏️ Edited' : '✨ New'}
                </div>
            </div>
        </div>
    `).join('');
}

// Todos functionality
function showTodoModal(todoId = null) {
    console.log('Showing todo modal for ID:', todoId);
    const modal = document.getElementById('todoModal');
    const title = document.getElementById('todoModalTitle');
    const todoTitle = document.getElementById('todoTitle');
    const todoCategory = document.getElementById('todoCategory');
    const todoDueDate = document.getElementById('todoDueDate');
    
    if (!modal || !title || !todoTitle || !todoCategory || !todoDueDate) {
        console.error('Todo modal elements not found');
        return;
    }
    
    appData.editingTodoId = todoId;
    
    if (todoId) {
        const todo = appData.todos.find(t => t.id === todoId);
        if (todo) {
            title.textContent = 'Edit Todo';
            todoTitle.value = todo.title;
            todoCategory.value = todo.category;
            todoDueDate.value = todo.dueDate;
        }
    } else {
        title.textContent = 'Create New Todo';
        todoTitle.value = '';
        todoCategory.value = 'personal';
        todoDueDate.value = '';
    }
    
    openModal('todoModal');
    setTimeout(() => todoTitle.focus(), 100);
}

function saveTodo() {
    console.log('Saving todo');
    const title = document.getElementById('todoTitle')?.value?.trim();
    const category = document.getElementById('todoCategory')?.value;
    const dueDate = document.getElementById('todoDueDate')?.value;
    
    if (!title) {
        alert('Please enter a todo title');
        return;
    }
    
    const now = new Date().toISOString();
    
    if (appData.editingTodoId) {
        // Edit existing todo
        const todoIndex = appData.todos.findIndex(t => t.id === appData.editingTodoId);
        if (todoIndex >= 0) {
            appData.todos[todoIndex] = {
                ...appData.todos[todoIndex],
                title,
                category,
                dueDate
            };
        }
    } else {
        // Create new todo
        const newTodo = {
            id: generateId(),
            title,
            category,
            dueDate,
            completed: false,
            createdAt: now
        };
        appData.todos.unshift(newTodo);
    }
    
    closeModal('todoModal');
    updateUI();
    showNotification(appData.editingTodoId ? 'Todo updated successfully!' : 'Todo created successfully!');
}

function toggleTodo(todoId) {
    console.log('Toggling todo:', todoId);
    const todoIndex = appData.todos.findIndex(t => t.id === todoId);
    if (todoIndex >= 0) {
        appData.todos[todoIndex].completed = !appData.todos[todoIndex].completed;
        updateUI();
        
        const todo = appData.todos[todoIndex];
        showNotification(todo.completed ? 'Todo completed! 🎉' : 'Todo marked as incomplete');
    }
}

function editTodo(todoId) {
    console.log('Editing todo:', todoId);
    showTodoModal(todoId);
}

function deleteTodo(todoId) {
    console.log('Deleting todo:', todoId);
    if (confirm('Are you sure you want to delete this todo?')) {
        appData.todos = appData.todos.filter(t => t.id !== todoId);
        updateUI();
        showNotification('Todo deleted successfully!');
    }
}

function renderTodos(searchTerm = '') {
    console.log('Rendering todos with search term:', searchTerm);
    const todosList = document.getElementById('todosList');
    const todosEmpty = document.getElementById('todosEmpty');
    
    if (!todosList || !todosEmpty) {
        console.error('Todo elements not found');
        return;
    }
    
    let filteredTodos = appData.todos;
    
    if (searchTerm) {
        filteredTodos = appData.todos.filter(todo => 
            todo.title.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredTodos.length === 0) {
        todosList.style.display = 'none';
        todosEmpty.style.display = 'block';
        
        if (searchTerm) {
            todosEmpty.innerHTML = `
                <div class="empty-icon">🔍</div>
                <h3>No todos found</h3>
                <p>No todos match your search for "${searchTerm}". Try different keywords.</p>
            `;
        } else {
            todosEmpty.innerHTML = `
                <div class="empty-icon">🎯</div>
                <h3>Organize your eco-friendly tasks</h3>
                <p>Create your first todo and stay organized while being environmentally conscious!</p>
                <button class="btn btn--primary" onclick="showTodoModal()">Create First Todo</button>
            `;
        }
        return;
    }
    
    todosEmpty.style.display = 'none';
    todosList.style.display = 'flex';
    
    // Sort todos: incomplete first, then completed
    const sortedTodos = filteredTodos.sort((a, b) => {
        if (a.completed === b.completed) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.completed - b.completed;
    });
    
    todosList.innerHTML = sortedTodos.map(todo => {
        const category = todoCategories[todo.category];
        const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''} fade-in">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo('${todo.id}')"></div>
                <div class="todo-content">
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                    <div class="todo-meta">
                        <div class="todo-category" style="background-color: ${category.color}20; color: ${category.color}">
                            ${category.icon} ${category.name}
                        </div>
                        ${todo.dueDate ? `
                            <div class="todo-due-date ${isOverdue ? 'overdue' : ''}">
                                📅 ${formatDate(todo.dueDate)}
                                ${isOverdue ? ' (Overdue)' : ''}
                            </div>
                        ` : ''}
                        <div class="todo-created">
                            Created ${formatDate(todo.createdAt)}
                        </div>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="note-btn" onclick="editTodo('${todo.id}')" title="Edit">✏️</button>
                    <button class="note-btn delete" onclick="deleteTodo('${todo.id}')" title="Delete">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

// Modal management
function openModal(modalId) {
    console.log('Opening modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Reset editing IDs
    appData.editingNoteId = null;
    appData.editingTodoId = null;
}

// Update UI
function updateUI() {
    console.log('Updating UI for tab:', appData.currentTab);
    updateStats();
    
    if (appData.currentTab === 'notes') {
        renderNotes();
    } else {
        renderTodos();
    }
}

function updateStats() {
    // Notes stats
    const notesStats = document.getElementById('notesStats');
    if (notesStats) {
        const notesCount = appData.notes.length;
        notesStats.textContent = `${notesCount} ${notesCount === 1 ? 'note' : 'notes'}`;
    }
    
    // Todos stats
    const todosStats = document.getElementById('todosStats');
    const progressFill = document.getElementById('todoProgress');
    
    if (todosStats && progressFill) {
        const todosCount = appData.todos.length;
        const completedCount = appData.todos.filter(t => t.completed).length;
        const progressPercent = todosCount > 0 ? Math.round((completedCount / todosCount) * 100) : 0;
        
        todosStats.textContent = `${completedCount}/${todosCount} completed`;
        progressFill.style.width = `${progressPercent}%`;
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    console.log('Showing notification:', message);
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-primary);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export/Import functionality
function exportData() {
    const data = {
        notes: appData.notes,
        todos: appData.todos,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `econotes-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Data exported successfully! 📁');
    closeModal('settingsModal');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        appData.notes = [];
        appData.todos = [];
        updateUI();
        showNotification('All data cleared successfully!');
        closeModal('settingsModal');
    }
}

// Global functions for HTML onclick events
window.showNoteModal = showNoteModal;
window.saveNote = saveNote;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.showTodoModal = showTodoModal;
window.saveTodo = saveTodo;
window.toggleTodo = toggleTodo;
window.editTodo = editTodo;
window.deleteTodo = deleteTodo;
window.openModal = openModal;
window.closeModal = closeModal;
window.exportData = exportData;
window.clearAllData = clearAllData;