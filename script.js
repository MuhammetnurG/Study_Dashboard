let assignments = [];
let schedule = [];
let notes = [];
let studentName = 'Student Name';

const STORAGE_KEY = 'studyDashboardData_v1';

let saveTimer = null;
const SAVE_DELAY = 600; // ms

async function tryLoadFromServer() {
    try {
        const resp = await fetch('/api/data', { cache: 'no-store' });
        if (!resp.ok) throw new Error('server returned ' + resp.status);
        const parsed = await resp.json();
        if (Array.isArray(parsed.assignments)) assignments = parsed.assignments;
        if (Array.isArray(parsed.schedule)) schedule = parsed.schedule;
        if (Array.isArray(parsed.notes)) notes = parsed.notes;
        if (parsed.studentName) {
            studentName = parsed.studentName;
            const el = document.getElementById('studentNameDisplay');
            if (el) el.textContent = studentName;
        }
        // also persist a local copy
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch (e) {}
        return true;
    } catch (e) {
        console.info('Server load failed, falling back to localStorage:', e);
        return false;
    }
}

function loadData() {
    // Try server first, otherwise fallback to localStorage
    tryLoadFromServer().then(ok => {
        if (!ok) {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed.assignments)) assignments = parsed.assignments;
                    if (Array.isArray(parsed.schedule)) schedule = parsed.schedule;
                    if (Array.isArray(parsed.notes)) notes = parsed.notes;
                    if (parsed.studentName) {
                        studentName = parsed.studentName;
                        const el = document.getElementById('studentNameDisplay');
                        if (el) el.textContent = studentName;
                    }
                }
            } catch (e) {
                console.warn('Failed to load saved data:', e);
            }
        }

        updateStats();
        displayAssignments();
        displaySchedule();
        displayNotes();
    });
}

function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveData().catch(()=>{}); saveTimer = null; }, SAVE_DELAY);
}

async function saveData() {
    const payload = { assignments, schedule, notes, studentName };
    // Optimistically save locally too
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (e) {}

    try {
        const resp = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error('server returned ' + resp.status);
        return true;
    } catch (e) {
        console.info('Server save failed, data saved locally only:', e);
        return false;
    }
}

function updateStudentName() {
    const input = document.getElementById('studentName').value.trim();
    if (input) {
        studentName = input;
        document.getElementById('studentNameDisplay').textContent = studentName;
        document.getElementById('studentName').value = '';
        scheduleSave();
    }
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
}

function addAssignment() {
    const title = document.getElementById('assignmentTitle').value.trim();
    const subject = document.getElementById('assignmentSubject').value.trim();
    const date = document.getElementById('assignmentDate').value;
    const priority = document.getElementById('assignmentPriority').value;
    const desc = document.getElementById('assignmentDesc').value.trim();

    if (!title || !subject || !date) {
        alert('Please fill in all required fields');
        return;
    }

    const assignment = {
        id: Date.now(),
        title,
        subject,
        date,
        priority,
        desc,
        completed: false
    };

    assignments.push(assignment);
    scheduleSave();
    updateStats();
    displayAssignments();

    document.getElementById('assignmentTitle').value = '';
    document.getElementById('assignmentSubject').value = '';
    document.getElementById('assignmentDate').value = '';
    document.getElementById('assignmentDesc').value = '';
}

function displayAssignments() {
    const list = document.getElementById('assignmentList');
    list.innerHTML = '';

    if (assignments.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No assignments yet</p>';
        return;
    }

    assignments.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(a => {
        const item = document.createElement('div');
        item.className = `assignment-item ${a.completed ? 'completed' : ''}`;
        item.innerHTML = `
            <h4><span class="subject-badge">${a.subject}</span>${a.title}</h4>
            <p>Due: ${new Date(a.date).toLocaleDateString()}</p>
            <p class="priority-${a.priority}">Priority: ${a.priority.toUpperCase()}</p>
            <p>${a.desc}</p>
            <button class="btn" onclick="toggleComplete(${a.id})" style="margin-top: 10px;">
                ${a.completed ? 'Undo' : 'Mark Complete'}
            </button>
            <button class="btn btn-danger" onclick="deleteAssignment(${a.id})">Delete</button>
        `;
        list.appendChild(item);
    });
}

function toggleComplete(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        assignment.completed = !assignment.completed;
        scheduleSave();
        updateStats();
        displayAssignments();
    }
}

function deleteAssignment(id) {
    assignments = assignments.filter(a => a.id !== id);
    scheduleSave();
    updateStats();
    displayAssignments();
}

function addSchedule() {
    const subject = document.getElementById('scheduleSubject').value.trim();
    const date = document.getElementById('scheduleDate').value;
    const start = document.getElementById('scheduleStart').value;
    const end = document.getElementById('scheduleEnd').value;
    const topics = document.getElementById('scheduleTopics').value.trim();

    if (!subject || !date || !start || !end) {
        alert('Please fill in all required fields');
        return;
    }

    const session = {
        id: Date.now(),
        subject,
        date,
        start,
        end,
        topics
    };

    schedule.push(session);
    scheduleSave();
    updateStats();
    displaySchedule();

    document.getElementById('scheduleSubject').value = '';
    document.getElementById('scheduleDate').value = '';
    document.getElementById('scheduleStart').value = '';
    document.getElementById('scheduleEnd').value = '';
    document.getElementById('scheduleTopics').value = '';
}

function displaySchedule() {
    const list = document.getElementById('scheduleList');
    list.innerHTML = '';

    if (schedule.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No study sessions scheduled</p>';
        return;
    }

    schedule.sort((a, b) => new Date(a.date + ' ' + a.start) - new Date(b.date + ' ' + b.start)).forEach(s => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        const duration = calculateDuration(s.start, s.end);
        item.innerHTML = `
            <h4><span class="subject-badge">${s.subject}</span>${new Date(s.date).toLocaleDateString()}</h4>
            <p>Time: ${s.start} - ${s.end} (${duration} hours)</p>
            <p>Topics: ${s.topics}</p>
            <button class="btn btn-danger" onclick="deleteSchedule(${s.id})" style="margin-top: 10px;">Delete</button>
        `;
        list.appendChild(item);
    });
}

function calculateDuration(start, end) {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const duration = (endH * 60 + endM - startH * 60 - startM) / 60;
    return duration.toFixed(1);
}

function deleteSchedule(id) {
    schedule = schedule.filter(s => s.id !== id);
    scheduleSave();
    updateStats();
    displaySchedule();
}

function saveNote() {
    const subject = document.getElementById('noteSubject').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (!subject || !content) {
        alert('Please fill in all fields');
        return;
    }

    const note = {
        id: Date.now(),
        subject,
        content,
        date: new Date().toLocaleDateString()
    };

    notes.push(note);
    scheduleSave();
    displayNotes();

    document.getElementById('noteSubject').value = '';
    document.getElementById('noteContent').value = '';
}

function clearNote() {
    document.getElementById('noteSubject').value = '';
    document.getElementById('noteContent').value = '';
}

function displayNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';

    if (notes.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No notes saved</p>';
        return;
    }

    notes.reverse().forEach(n => {
        const item = document.createElement('div');
        item.className = 'assignment-item';
        item.innerHTML = `
            <h4><span class="subject-badge">${n.subject}</span>Saved on ${n.date}</h4>
            <p style="white-space: pre-wrap; margin-top: 10px;">${n.content}</p>
            <button class="btn btn-danger" onclick="deleteNote(${n.id})" style="margin-top: 10px;">Delete</button>
        `;
        list.appendChild(item);
    });
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    scheduleSave();
    displayNotes();
}

function updateStats() {
    const total = assignments.length;
    const completed = assignments.filter(a => a.completed).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    let totalHours = 0;
    schedule.forEach(s => {
        totalHours += parseFloat(calculateDuration(s.start, s.end));
    });

    document.getElementById('totalAssignments').textContent = total;
    document.getElementById('completedAssignments').textContent = completed;
    document.getElementById('pendingAssignments').textContent = pending;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);

    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = percentage + '%';
    progressBar.textContent = percentage + '%';
}

window.onload = loadData;
