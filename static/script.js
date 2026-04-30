
let routines = window.routines || [];
let exercises = window.exercises || [];
let history = window.historyData || [];

let selectedExercises = [];
let currentWorkout = null;

let timerInterval = null;
let timeLeft = 0;


// ===== PAGE NAV =====
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
    document.getElementById("routine-form").classList.toggle("hidden");
    loadExerciseChoices();
}


function loadExerciseChoices() {
    const list = document.getElementById("exercise-choice-list");
    list.innerHTML = "";

    exercises.forEach(ex => {
        list.innerHTML += `
            <button class="exercise-choice" id="ex-${ex.Exercise_ID}"
                onclick="selectExercise(${ex.Exercise_ID})">
                ${ex.Name}
            </button>
        `;
    });
}


function selectExercise(id) {
    const btn = document.getElementById("ex-" + id);

    if (selectedExercises.includes(id)) {
        selectedExercises = selectedExercises.filter(e => e !== id);
        btn.classList.remove("selected");
    } else {
        selectedExercises.push(id);
        btn.classList.add("selected");
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
    const name = document.getElementById("routine-name").value.trim();
    const description = document.getElementById("routine-description").value.trim();

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
    if (!confirm("Delete routine?")) return;

    fetch("/delete_routine/" + id, { method: "DELETE" })
        .then(() => location.reload());
}


// ===== WORKOUT =====
function startRoutine(id) {
    fetch("/get_routine/" + id)
        .then(res => res.json())
        .then(data => {

            currentWorkout = {
                id: data.id,
                name: data.name,
                startTime: Date.now(),
                exercises: data.exercises.map(ex => ({
                    id: ex.Exercise_ID,
                    name: ex.Name,
                    restTime: ex.Rest_Time || 60,
                    sets: [{ weight: "", reps: "" }]
                }))
            };

            renderWorkout();
            showPage("workout");
        });
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
                    <input type="number" placeholder="Weight"
                        onchange="updateSet(${exIndex}, ${setIndex}, 'weight', this.value)">
                    <input type="number" placeholder="Reps"
                        onchange="updateSet(${exIndex}, ${setIndex}, 'reps', this.value)">
                    <button onclick="startRestTimer(${exIndex})">Rest</button>
                </div>
            `;
        });

        list.innerHTML += `
            <div class="workout-card">
                <h3>${exercise.name}</h3>

                <div class="rest-box">
                    <label>Rest Time (seconds)</label>
                    <input type="number" value="${exercise.restTime}"
                        onchange="changeRestTime(${exIndex}, this.value)">
                </div>

                ${setsHTML}
                <button class="green-btn" onclick="addSet(${exIndex})">Add Set</button>
            </div>
        `;
    });
}


function updateSet(exIndex, setIndex, field, value) {
    currentWorkout.exercises[exIndex].sets[setIndex][field] = value;
}


function addSet(exIndex) {
    currentWorkout.exercises[exIndex].sets.push({ weight: "", reps: "" });
    renderWorkout();
}


function changeRestTime(exIndex, value) {
    currentWorkout.exercises[exIndex].restTime = Number(value);
}


// ===== REST TIMER =====
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

    document.getElementById("timer-box").textContent =
        `Rest Timer: ${min}:${sec}`;
}


// ===== SAVE WORKOUT =====
function finishWorkout() {
    fetch("/save_workout", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            routine_id: currentWorkout.id,
            exercises: currentWorkout.exercises
        })
    }).then(() => {
        alert("Workout saved");
        location.reload();
    });
}


function cancelWorkout() {
    currentWorkout = null;
    clearInterval(timerInterval);
    showPage("dashboard");
}


// ===== EXERCISES =====
function renderExercises() {
    const list = document.getElementById("exercise-list");
    list.innerHTML = "";

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

    history.forEach(item => {
        list.innerHTML += `
            <div class="history-item">
                <h3>${item.ROUTINE_NAME}</h3>
                <p>${item.Date}</p>
            </div>
        `;
    });
}


// ===== DASHBOARD =====
function renderDashboard() {
    document.getElementById("total-routines").textContent = routines.length;
    document.getElementById("total-workouts").textContent = history.length;

    const lastBox = document.getElementById("last-session-box");

    if (history.length === 0) {
        lastBox.innerHTML = `<p class="small-text">No workouts yet</p>`;
    } else {
        const last = history[0];

        lastBox.innerHTML = `
            <p class="label green">Last Session</p>
            <h3>${last.ROUTINE_NAME}</h3>
            <p class="small-text">${last.Date}</p>
        `;
    }
}


// ===== INIT =====
window.onload = function () {
    showPage("dashboard");
};
