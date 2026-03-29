const exercises = [
    { id: 1, name: "Bench Press", category: "Chest" },
    { id: 2, name: "Squats", category: "Legs" },
    { id: 3, name: "Deadlift", category: "Back / Legs" },
    { id: 4, name: "Pull Ups", category: "Back" },
    { id: 5, name: "Shoulder Press", category: "Shoulders" },
    { id: 6, name: "Bicep Curls", category: "Arms" }
];

let appData = {
    user: { name: "Alex Johnson" },
    routines: JSON.parse(localStorage.getItem("routines")) || [],
    history: JSON.parse(localStorage.getItem("history")) || []
};

let currentWorkout = null;

// SAVE
function saveToStorage() {
    localStorage.setItem("routines", JSON.stringify(appData.routines));
    localStorage.setItem("history", JSON.stringify(appData.history));
}

// NAVIGATION
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

    document.getElementById(pageId).classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        if (btn.textContent.toLowerCase() === pageId) {
            btn.classList.add("active");
        }
    });

    if (pageId === "dashboard") renderDashboard();
    if (pageId === "routines") renderRoutines();
    if (pageId === "exercises") renderExercises();
    if (pageId === "history") renderHistory();
}

// 🔥 DASHBOARD FIXED
function renderDashboard() {
    document.getElementById("total-workouts").textContent = appData.history.length;
    document.getElementById("total-routines").textContent = appData.routines.length;

    // LAST SESSION
    const lastSessionBox = document.getElementById("last-session-box");

    if (appData.history.length > 0) {
        const last = appData.history[0];

        lastSessionBox.innerHTML = `
            <p class="label">Last Session</p>
            <h3>${last.routineName}</h3>
            <p>${last.date}</p>
            <p>${last.duration} min</p>
        `;
    } else {
        lastSessionBox.innerHTML = `<p>No workouts yet</p>`;
    }

    // 🔥 QUICK START FIXED
    const quickStartBox = document.getElementById("quick-start-box");

    if (appData.routines.length > 0) {
        const routine = appData.routines[0];

        quickStartBox.innerHTML = `
            <div class="quick-box">
                <div>
                    <h3>${routine.name}</h3>
                    <p>${routine.exercises.length} exercises</p>
                </div>
                <button class="green-btn" onclick="startWorkout(${routine.id})">
                    Start Workout
                </button>
            </div>
        `;
    } else {
        quickStartBox.innerHTML = `<p>No routines yet</p>`;
    }
}

// ROUTINES
function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    appData.routines.forEach(r => {
        list.innerHTML += `
            <div class="routine-card">
                <div>
                    <h3>${r.name}</h3>
                    <p>${r.exercises.length} exercises</p>
                </div>
                <div>
                    <button class="green-btn" onclick="startWorkout(${r.id})">Start</button>
                    <button class="dark-btn" onclick="deleteRoutine(${r.id})">Delete</button>
                </div>
            </div>
        `;
    });
}

// DELETE
function deleteRoutine(id) {
    appData.routines = appData.routines.filter(r => r.id !== id);
    saveToStorage();
    renderRoutines();
    renderDashboard();
}

// ADD ROUTINE (simple version)
function addRoutine() {
    const name = document.getElementById("routine-name").value;

    if (!name) return;

    appData.routines.unshift({
        id: Date.now(),
        name: name,
        exercises: [1, 2]
    });

    saveToStorage();
    renderRoutines();
    renderDashboard();
}

// EXERCISES
function renderExercises() {
    const list = document.getElementById("exercise-list");
    list.innerHTML = "";

    exercises.forEach(e => {
        list.innerHTML += `
            <div class="exercise-card">
                <h3>${e.name}</h3>
                <p>${e.category}</p>
            </div>
        `;
    });
}

// HISTORY
function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    appData.history.forEach(h => {
        list.innerHTML += `
            <div class="history-card">
                <h3>${h.routineName}</h3>
                <p>${h.date}</p>
                <p>${h.duration} min</p>
            </div>
        `;
    });
}

// START WORKOUT
function startWorkout(id) {
    const routine = appData.routines.find(r => r.id === id);
    if (!routine) return;

    currentWorkout = {
        routineName: routine.name,
        startTime: Date.now()
    };

    showPage("workout");
}

// FINISH WORKOUT
function finishWorkout() {
    const duration = Math.max(1, Math.floor((Date.now() - currentWorkout.startTime) / 60000));

    appData.history.unshift({
        routineName: currentWorkout.routineName,
        date: new Date().toLocaleDateString(),
        duration: duration
    });

    saveToStorage();
    renderDashboard();
    renderHistory();
    showPage("dashboard");
}

// INIT
window.onload = function () {
    renderDashboard();
    renderRoutines();
    renderExercises();
    renderHistory();
};
