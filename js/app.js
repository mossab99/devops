/**
 * StudySync Application Logic
 * Handles CRUD operations with LocalStorage and DOM updates
 */

// --- State Management ---
let state = {
    subjects: [],
    tasks: [],
    currentSubjectId: null
};

// --- Data Service (LocalStorage) ---
const STORAGE_KEY = 'studysync_data';

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        state = JSON.parse(saved);
    } else {
        // Initial dummy data for better first impression
        state.subjects = [
            { id: 'sub-1', name: 'Mathematics', color: '#6366f1' },
            { id: 'sub-2', name: 'Physics', color: '#ec4899' }
        ];
        state.tasks = [
            { id: 'task-1', subjectId: 'sub-1', title: 'Practice Calculus', date: '2026-01-20', priority: 'high', completed: false },
            { id: 'task-2', subjectId: 'sub-1', title: 'Algebra Quiz Preparation', date: '2026-01-22', priority: 'medium', completed: true }
        ];
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- DOM Elements ---
const subjectListEl = document.getElementById('subject-list');
const taskListEl = document.getElementById('task-list');
const currentSubjectNameEl = document.getElementById('current-subject-name');
const addTaskBtn = document.getElementById('add-task-btn');

// Modals
const subjectModal = document.getElementById('subject-modal');
const taskModal = document.getElementById('task-modal');
const subjectForm = document.getElementById('subject-form');
const taskForm = document.getElementById('task-form');

// --- Rendering ---
function renderSubjects() {
    subjectListEl.innerHTML = '';
    state.subjects.forEach(subject => {
        const li = document.createElement('li');
        li.className = `subject-item ${state.currentSubjectId === subject.id ? 'active' : ''}`;
        li.onclick = () => selectSubject(subject.id);
        
        li.innerHTML = `
            <span class="color-dot" style="background: ${subject.color}"></span>
            <span style="flex: 1">${subject.name}</span>
            <button class="btn-delete" onclick="deleteSubject(event, '${subject.id}')" style="background:none; border:none; color:var(--error); cursor:pointer;">×</button>
        `;
        subjectListEl.appendChild(li);
    });
}

function renderTasks() {
    taskListEl.innerHTML = '';
    
    if (!state.currentSubjectId) {
        taskListEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 3rem;">Select a subject to see tasks.</div>';
        addTaskBtn.disabled = true;
        return;
    }

    addTaskBtn.disabled = false;
    const filteredTasks = state.tasks.filter(t => t.subjectId === state.currentSubjectId);
    
    if (filteredTasks.length === 0) {
        taskListEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 3rem;">No tasks yet. Click "Add Task" to start!</div>';
        return;
    }

    filteredTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `
            <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')"></div>
            <div class="task-content">
                <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                <div class="task-meta">
                    ${task.date ? 'Due: ' + task.date : 'No date'} • 
                    <span style="color: ${getPriorityColor(task.priority)}">${task.priority.toUpperCase()}</span>
                </div>
            </div>
            <div class="task-actions">
                <button onclick="editTask('${task.id}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; margin-right: 10px;">✎</button>
                <button onclick="deleteTask('${task.id}')" style="background:none; border:none; color:var(--error); cursor:pointer;">🗑</button>
            </div>
        `;
        taskListEl.appendChild(div);
    });
}

function getPriorityColor(priority) {
    switch(priority) {
        case 'high': return '#ef4444';
        case 'medium': return '#f59e0b';
        case 'low': return '#10b981';
        default: return 'inherit';
    }
}

// --- Actions ---
function selectSubject(id) {
    state.currentSubjectId = id;
    const subject = state.subjects.find(s => s.id === id);
    currentSubjectNameEl.textContent = subject ? subject.name : 'Select a Subject';
    renderSubjects();
    renderTasks();
}

function addSubject(name, color) {
    const newSubject = {
        id: 'sub-' + Date.now(),
        name,
        color
    };
    state.subjects.push(newSubject);
    saveData();
    renderSubjects();
}

function deleteSubject(event, id) {
    event.stopPropagation();
    if (confirm('Delete this subject and all its tasks?')) {
        state.subjects = state.subjects.filter(s => s.id !== id);
        state.tasks = state.tasks.filter(t => t.subjectId !== id);
        if (state.currentSubjectId === id) state.currentSubjectId = null;
        saveData();
        renderSubjects();
        renderTasks();
    }
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
}

function editTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-date').value = task.date || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-modal-title').textContent = 'Edit Task';
        taskModal.classList.add('open');
    }
}

// --- Modal Logic ---
document.getElementById('add-subject-btn').onclick = () => subjectModal.classList.add('open');
document.getElementById('close-subject-modal').onclick = () => subjectModal.classList.remove('open');

document.getElementById('add-task-btn').onclick = () => {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-modal-title').textContent = 'New Task';
    taskModal.classList.add('open');
};
document.getElementById('close-task-modal').onclick = () => taskModal.classList.remove('open');

subjectForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('subject-name').value;
    const color = document.getElementById('subject-color').value;
    addSubject(name, color);
    subjectForm.reset();
    subjectModal.classList.remove('open');
};

taskForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const date = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;

    if (id) {
        // Update
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.title = title;
            task.date = date;
            task.priority = priority;
        }
    } else {
        // Create
        state.tasks.push({
            id: 'task-' + Date.now(),
            subjectId: state.currentSubjectId,
            title,
            date,
            priority,
            completed: false
        });
    }

    saveData();
    renderTasks();
    taskModal.classList.remove('open');
};

// Initial Load
loadData();
renderSubjects();
if (state.subjects.length > 0) {
    selectSubject(state.subjects[0].id);
} else {
    renderTasks();
}
