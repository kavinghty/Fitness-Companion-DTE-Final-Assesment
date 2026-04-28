// ===== GLOBAL DATA =====
let routines = window.routines || [];
let exercises = window.exercises || [];
let history = window.historyData || [];

let selectedExercises = [];
let currentWorkout = null;


// ===== PAGE SWITCH =====
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");

    if (pageId === "dashboard") renderDashboard();
    if (pageId === "routines") renderRoutines();
    if (pageId === "exercises") renderExercises();
    if (pageId === "history") renderHistory();
}


// ===== ROUTINE FORM =====
function toggleForm() {
    const form = document.getElementById("routine-form");
    form.classList.toggle("hidden");
    loadExerciseChoices();
}


function loadExerciseChoices() {
    const list = document.getElementById("exercise-choice-list");
    list.innerHTML = "";

    exercises.forEach(ex => {
        list.innerHTML += `
            <button class="exercise-choice" onclick="selectExercise(${ex.Exercise_ID})">
                ${ex.Name}
            </button>
        `;
    });
}


function selectExercise(id) {
    if (selectedExercises.includes(id)) {
        selectedExercises = selectedExercises.filter(e => e !== id);
    } else {
        selectedExercises.push(id);
    }
}


// ===== ROUTINES =====
function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    routines.forEach(r => {
        list.innerHTML += `
            <div class="routine-card">
                <div>
                    <h3>${r.ROUTINE_NAME}</h3>
                    <p class="small-text">${r.DESCRIPTION || "No description"}</p>
                </div>

                <div class="button-group">
                    <button class="green-btn" onclick="startRoutine(${r.ROUTINE_ID})">Start</button>
                    <button class="dark-btn" onclick="deleteRoutine(${r.ROUTINE_ID})">Delete</button>
                </div>
            </div>
        `;
    });
}


function addRoutine() {
    const name = document.getElementById("routine-name").value;
    const description = document.getElementById("routine-description").value;

    if (!name || selectedExercises.length === 0) {
        alert("Enter name and select exercises");
        return;
    }

    fetch("/add_routine", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name,
            description,
            exercises: selectedExercises
        })
    }).then(() => location.reload());
}


function deleteRoutine(id) {
    fetch("/delete_routine/" + id, {method: "DELETE"})
        .then(() => location.reload());
}


// ===== EXERCISES =====
function renderExercises() {
    const list = document.getElementById("exercise-list");
    list.innerHTML = "";

    if (exercises.length === 0) {
        list.innerHTML = "<p>No exercises found</p>";
        return;
    }

    exercises.forEach(ex => {
        list.innerHTML += `
            <div class="exercise-card">
                <h3>${ex.Name}</h3>
                <p class="small-text">${ex.Description || ""}</p>
            </div>
        `;
    });
}


// ===== HISTORY =====
function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    if (history.length === 0) {
        list.innerHTML = "<p>No workouts yet</p>";
        return;
    }

    history.forEach(h => {
        list.innerHTML += `
            <div class="history-item">
                <h3>${h.ROUTINE_NAME}</h3>
                <p>${h.Date}</p>
            </div>
        `;
    });
}


// ===== WORKOUT =====
function startRoutine(id) {
    fetch("/get_routine/" + id)
        .then(res => res.json())
        .then(data => {
            currentWorkout = data;

            showPage("workout");

            const list = document.getElementById("workout-exercise-list");
            list.innerHTML = "";

            data.exercises.forEach(ex => {
                list.innerHTML += `<div class="workout-card">${ex.Name}</div>`;
            });
        });
}


function finishWorkout() {
    fetch("/save_workout", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            routine_id: currentWorkout.id,
            exercises: currentWorkout.exercises
        })
    }).then(() => {
        alert("Saved!");
        location.reload();
    });
}


function cancelWorkout() {
    currentWorkout = null;
    showPage("dashboard");
}


// ===== DASHBOARD =====
function renderDashboard() {
    document.getElementById("total-workouts").textContent = history.length;
    document.getElementById("total-routines").textContent = routines.length;

    const lastBox = document.getElementById("last-session-box");

    if (history.length === 0) {
        lastBox.innerHTML = "<p>No workouts yet</p>";
    } else {
        const last = history[0];
        lastBox.innerHTML = `
            <p class="label green">Last Session</p>
            <h3>${last.ROUTINE_NAME}</h3>
            <p>${last.Date}</p>
        `;
    }
}


// ===== INIT =====
window.onload = function () {
    showPage("dashboard");
};
