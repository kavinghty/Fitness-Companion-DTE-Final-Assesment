let routines = [];
let history = JSON.parse(localStorage.getItem("history")) || [];

let selectedExercises = [];
let currentWorkout = null;

let timerInterval = null;
let timeLeft = 0;

let exercises = [];

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    const buttons = document.querySelectorAll(".nav-btn");

    pages.forEach(page => page.classList.remove("active"));
    buttons.forEach(button => button.classList.remove("active"));

    document.getElementById(pageId).classList.add("active");

    buttons.forEach(button => {
        if (button.textContent.toLowerCase() === pageId) {
            button.classList.add("active");
        }
    });

    if (pageId === "dashboard") renderDashboard();
    if (pageId === "history") renderHistory();
    if (pageId === "exercises") renderExercises();
    if (pageId === "routines") loadRoutines();
}

async function loadExercisesFromDB() {
    const res = await fetch("/api/exercises");
    const data = await res.json();

    exercises = data.map(e => ({
        id: e.Exercise_ID,
        name: e.Name
    }));

    renderExercises();
}

async function loadRoutines() {
    const res = await fetch("/api/routines");
    const data = await res.json();

    routines = data.map(r => ({
        id: r.ROUTINE_ID,
        name: r.ROUTINE_NAME,
        description: r.DESCRIPTION || "",
        exercises: []
    }));

    renderRoutines();
    renderDashboard();
}

async function addRoutine() {
    const name = document.getElementById("routine-name").value.trim();
    const description = document.getElementById("routine-description").value.trim();

    if (name === "" || selectedExercises.length === 0) return;

    await fetch("/api/add_routine", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            description
        })
    });

    selectedExercises = [];

    document.getElementById("routine-name").value = "";
    document.getElementById("routine-description").value = "";
    document.getElementById("routine-form").classList.add("hidden");

    loadRoutines();
}

async function deleteRoutine(id) {
    const confirmDelete = confirm("Delete this routine?");
    if (!confirmDelete) return;

    await fetch(`/api/delete_routine/${id}`, {
        method: "DELETE"
    });

    loadRoutines();
}

function toggleForm() {
    document.getElementById("routine-form").classList.toggle("hidden");
    loadExerciseChoices();
}

function loadExerciseChoices() {
    const list = document.getElementById("exercise-choice-list");
    list.innerHTML = "";

    exercises.forEach(ex => {
        list.innerHTML += `
            <button class="exercise-choice" id="ex-${ex.id}" onclick="selectExercise(${ex.id})">
                ${ex.name}
            </button>
        `;
    });
}

function selectExercise(id) {
    const index = selectedExercises.indexOf(id);

    if (index === -1) {
        selectedExercises.push(id);
        document.getElementById("ex-" + id).classList.add("selected");
    } else {
        selectedExercises.splice(index, 1);
        document.getElementById("ex-" + id).classList.remove("selected");
    }
}

function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    routines.forEach(r => {
        list.innerHTML += `
            <div class="routine-card">
                <div>
                    <h3>${r.name}</h3>
                    <p class="small-text">${r.description || "No description"}</p>
                </div>

                <div class="button-group">
                    <button class="green-btn" onclick="startRoutine('${r.name}')">Start</button>
                    <button class="dark-btn" onclick="deleteRoutine(${r.id})">Delete</button>
                </div>
            </div>
        `;
    });
}

function startRoutine(name) {
    const routine = routines.find(r => r.name === name);

    currentWorkout = {
        name: routine.name,
        startTime: Date.now(),
        exercises: routine.exercises.map(id => {
            const ex = exercises.find(e => e.id === id);
            return {
                name: ex.name,
                restTime: 60,
                sets: [{ weight: "", reps: "" }]
            };
        })
    };

    renderWorkout();
    showWorkoutPage();
}

function showWorkoutPage() {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("workout").classList.add("active");
}

function renderWorkout() {
    document.getElementById("workout-title").textContent = currentWorkout.name;

    const list = document.getElementById("workout-exercise-list");
    list.innerHTML = "";

    currentWorkout.exercises.forEach((exercise, exIndex) => {
        let setsHTML = "";

        exercise.sets.forEach((set, setIndex) => {
            setsHTML += `
                <div class="set-row">
                    <div>Set ${setIndex + 1}</div>
                    <input type="number" onchange="updateSet(${exIndex}, ${setIndex}, 'weight', this.value)">
                    <input type="number" onchange="updateSet(${exIndex}, ${setIndex}, 'reps', this.value)">
                    <button onclick="startRestTimer(${exIndex})">Rest</button>
                </div>
            `;
        });

        list.innerHTML += `
            <div class="workout-card">
                <h3>${exercise.name}</h3>
                <div class="rest-box">
                    <label>Rest Time</label>
                    <input type="number" value="${exercise.restTime}" onchange="changeRestTime(${exIndex}, this.value)">
                </div>
                ${setsHTML}
                <button class="green-btn" onclick="addSet(${exIndex})">Add Set</button>
            </div>
        `;
    });
}

function changeRestTime(exIndex, value) {
    currentWorkout.exercises[exIndex].restTime = Number(value);
}

function startRestTimer(exIndex) {
    clearInterval(timerInterval);
    timeLeft = currentWorkout.exercises[exIndex].restTime;
    updateTimer();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) clearInterval(timerInterval);
    }, 1000);
}

function updateTimer() {
    const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const sec = String(timeLeft % 60).padStart(2, "0");
    document.getElementById("timer-box").textContent = `Rest Timer: ${min}:${sec}`;
}

function updateSet(exIndex, setIndex, field, value) {
    currentWorkout.exercises[exIndex].sets[setIndex][field] = value;
}

function addSet(exIndex) {
    currentWorkout.exercises[exIndex].sets.push({ weight: "", reps: "" });
    renderWorkout();
}

function finishWorkout() {
    const duration = Math.max(1, Math.floor((Date.now() - currentWorkout.startTime) / 60000));

    history.unshift({
        name: currentWorkout.name,
        date: new Date().toLocaleDateString(),
        duration
    });

    localStorage.setItem("history", JSON.stringify(history));

    currentWorkout = null;
    clearInterval(timerInterval);

    renderDashboard();
    renderHistory();
    showPage("dashboard");
}

function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    history.forEach(item => {
        list.innerHTML += `
            <div class="history-item">
                <h3>${item.name}</h3>
                <p>${item.date}</p>
                <p>${item.duration} min</p>
            </div>
        `;
    });
}

function renderExercises() {
    const list = document.getElementById("exercise-list");
    list.innerHTML = "";

    exercises.forEach(ex => {
        list.innerHTML += `
            <div class="exercise-card">
                <h3>${ex.name}</h3>
            </div>
        `;
    });
}

function renderDashboard() {
    document.getElementById("total-routines").textContent = routines.length;
    document.getElementById("total-workouts").textContent = history.length;

    const quickBox = document.getElementById("quick-start-box");
    const lastBox = document.getElementById("last-session-box");

    if (quickBox) {
        if (routines.length === 0) {
            quickBox.innerHTML = `<p class="small-text">No routines yet</p>`;
        } else {
            const r = routines[0];
            quickBox.innerHTML = `
                <div class="quick-box">
                    <div>
                        <h3>${r.name}</h3>
                        <p class="small-text">${r.exercises.length} exercises</p>
                    </div>
                    <button class="green-btn" onclick="startRoutine('${r.name}')">Start</button>
                </div>
            `;
        }
    }

    if (lastBox) {
        if (history.length === 0) {
            lastBox.style.display = "none";
        } else {
            lastBox.style.display = "block";
            const last = history[0];
            lastBox.innerHTML = `
                <p class="label green">Last Session</p>
                <h3>${last.name}</h3>
                <p class="small-text">${last.date}</p>
                <h2 class="green">${last.duration} min</h2>
            `;
        }
    }
}

window.onload = function () {
    loadExercisesFromDB();
    loadRoutines();
    renderHistory();
    showPage("dashboard");
};
