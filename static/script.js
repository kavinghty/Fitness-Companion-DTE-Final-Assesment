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

    if (pageId === "history") renderHistory();
    if (pageId === "exercises") renderExercises();
    if (pageId === "dashboard") renderDashboard();
}

let routines = [];
let history = [];
let selectedExercises = [];

const exercises = [
    { id: 1, name: "Bench Press", category: "Chest" },
    { id: 2, name: "Squats", category: "Legs" },
    { id: 3, name: "Deadlift", category: "Back / Legs" },
    { id: 4, name: "Pull Ups", category: "Back" },
    { id: 5, name: "Shoulder Press", category: "Shoulders" },
    { id: 6, name: "Bicep Curls", category: "Arms" }
];

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

function addRoutine() {
    const name = document.getElementById("routine-name").value.trim();
    const description = document.getElementById("routine-description").value.trim();

    if (name === "" || selectedExercises.length === 0) return;

    routines.unshift({
        name: name,
        description: description,
        exercises: [...selectedExercises]
    });

    renderRoutines();
    renderDashboard();

    document.getElementById("routine-name").value = "";
    document.getElementById("routine-description").value = "";
    selectedExercises = [];
}

function deleteRoutine(index) {
    routines.splice(index, 1);
    renderRoutines();
    renderDashboard();
}

function startRoutine(name) {
    alert("Starting workout: " + name);
}

function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    routines.forEach((routine, index) => {
        list.innerHTML += `
            <div class="routine-card">
                <div>
                    <h3>${routine.name}</h3>
                    <p class="small-text">${routine.description || "No description"}</p>
                    <p class="small-text">${routine.exercises.length} exercises</p>
                </div>
                <div class="button-group">
                    <button class="green-btn" onclick="startRoutine('${routine.name}')">Start</button>
                    <button class="dark-btn" onclick="deleteRoutine(${index})">Delete</button>
                </div>
            </div>
        `;
    });
}

function renderDashboard() {
    document.getElementById("total-routines").textContent = routines.length;
    document.getElementById("total-workouts").textContent = history.length;

    const lastBox = document.getElementById("last-session-box");

    if (history.length > 0) {
        const last = history[0];
        lastBox.innerHTML = `
            <p class="label green">Last Session</p>
            <h3>${last}</h3>
        `;
        document.getElementById("last-duration").textContent = "45 min";
    } else {
        lastBox.innerHTML = `<p class="small-text">No workouts yet</p>`;
    }

    const quick = document.getElementById("quick-start-box");

    if (routines.length > 0) {
        quick.innerHTML = `
            <div class="quick-box">
                <div>
                    <h3>${routines[0].name}</h3>
                    <p class="small-text">${routines[0].exercises.length} exercises</p>
                </div>
                <button class="green-btn" onclick="startRoutine('${routines[0].name}')">Start</button>
            </div>
        `;
    } else {
        quick.innerHTML = `<p class="small-text">No routines available</p>`;
    }
}

function renderExercises() {
    const list = document.getElementById("exercise-list");
    list.innerHTML = "";

    exercises.forEach(ex => {
        list.innerHTML += `
            <div class="exercise-card">
                <h3>${ex.name}</h3>
                <p class="small-text">${ex.category}</p>
            </div>
        `;
    });
}

function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    history.forEach(item => {
        list.innerHTML += `
            <div class="history-item">
                <p>${item}</p>
            </div>
        `;
    });
}

window.onload = function() {
    showPage("dashboard");
}
