let routines = window.routines || [];
let exercises = window.exercises || [];
let history = window.historyData || [];

let currentWorkout = null;


// NAVIGATION
function showPage(page) {
    ["dashboard","routines","exercises","history","workout"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });

    document.getElementById(page).style.display = "block";

    if (page === "dashboard") renderDashboard();
    if (page === "routines") renderRoutines();
    if (page === "exercises") renderExercises();
    if (page === "history") renderHistory();
}


// DASHBOARD
function renderDashboard() {
    document.getElementById("total-routines").textContent = routines.length;
    document.getElementById("total-workouts").textContent = history.length;
}


// ROUTINES
function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    routines.forEach(r => {
        list.innerHTML += `
            <div>
                ${r.ROUTINE_NAME}
                <button onclick="startRoutine(${r.ROUTINE_ID})">Start</button>
                <button onclick="deleteRoutine(${r.ROUTINE_ID})">Delete</button>
            </div>
        `;
    });
}


function addRoutine() {
    const name = document.getElementById("routine-name").value;

    if (!name) return;

    fetch("/add_routine", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            name: name,
            description: "",
            exercises: []
        })
    }).then(() => location.reload());
}


function deleteRoutine(id) {
    fetch("/delete_routine/" + id, { method: "DELETE" })
        .then(() => location.reload());
}


// EXERCISES
function renderExercises() {
    const list = document.getElementById("exercise-list");
    list.innerHTML = "";

    exercises.forEach(ex => {
        list.innerHTML += `<div>${ex.Name}</div>`;
    });
}


// HISTORY
function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    history.forEach(h => {
        list.innerHTML += `<div>${h.ROUTINE_NAME} - ${h.Date}</div>`;
    });
}


// WORKOUT
function startRoutine(id) {
    currentWorkout = { id };

    document.getElementById("workout-title").textContent = "Workout Started";
    showPage("workout");
}


function finishWorkout() {
    fetch("/save_workout", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            routine_id: currentWorkout.id,
            exercises: []
        })
    }).then(() => {
        alert("Saved");
        location.reload();
    });
}


// INIT
window.onload = () => showPage("dashboard");
