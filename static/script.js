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
}

let routines = [];
let history = [];

const exercises = [
    { name: "Bench Press", category: "Chest" },
    { name: "Squats", category: "Legs" },
    { name: "Deadlift", category: "Back / Legs" },
    { name: "Pull Ups", category: "Back" },
    { name: "Shoulder Press", category: "Shoulders" },
    { name: "Bicep Curls", category: "Arms" }
];

function toggleForm() {
    document.getElementById("routine-form").classList.toggle("hidden");
}

function addRoutine() {
    const name = document.getElementById("routine-name").value.trim();
    const description = document.getElementById("routine-description").value.trim();

    if (name === "") return;

    routines.push({
        name: name,
        description: description
    });

    renderRoutines();
    document.getElementById("routine-name").value = "";
    document.getElementById("routine-description").value = "";
}

function deleteRoutine(index) {
    routines.splice(index, 1);
    renderRoutines();
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
                </div>
                <div class="button-group">
                    <button class="green-btn" onclick="startRoutine('${routine.name}')">Start</button>
                    <button class="dark-btn" onclick="deleteRoutine(${index})">Delete</button>
                </div>
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
