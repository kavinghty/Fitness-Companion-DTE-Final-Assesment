const exercises = [
    { id: 1, name: "Bench Press" },
    { id: 2, name: "Squats" },
    { id: 3, name: "Deadlift" },
    { id: 4, name: "Pull Ups" },
    { id: 5, name: "Shoulder Press" },
    { id: 6, name: "Bicep Curls" }
];

let routines = JSON.parse(localStorage.getItem("routines")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

let selectedExercises = [];
let currentWorkout = null;

let timerInterval = null;
let timeLeft = 0;

/* ---------------- SAVE ---------------- */
function saveData() {
    localStorage.setItem("routines", JSON.stringify(routines));
    localStorage.setItem("history", JSON.stringify(history));
}

/* ---------------- PAGE SWITCH ---------------- */
function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    const buttons = document.querySelectorAll(".nav-btn");

    pages.forEach(p => p.classList.remove("active"));
    buttons.forEach(b => b.classList.remove("active"));

    document.getElementById(pageId).classList.add("active");

    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase() === pageId) {
            btn.classList.add("active");
        }
    });

    if (pageId === "dashboard") renderDashboard();
    if (pageId === "routines") renderRoutines();
    if (pageId === "exercises") renderExercises();
    if (pageId === "history") renderHistory();
}

/* ---------------- FORM ---------------- */
function toggleForm() {
    document.getElementById("routine-form").classList.toggle("hidden");
    loadExerciseChoices();
}

/* ---------------- LOAD EXERCISES ---------------- */
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

/* ---------------- SELECT EXERCISE ---------------- */
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

/* ---------------- ADD ROUTINE ---------------- */
function addRoutine() {
    const name = document.getElementById("routine-name").value.trim();
    const description = document.getElementById("routine-description").value.trim();

    if (name === "" || selectedExercises.length === 0) {
        alert("Enter a name and pick at least one exercise");
        return;
    }

    routines.unshift({
        name,
        description,
        exercises: [...selectedExercises]
    });

    saveData();

    document.getElementById("routine-name").value = "";
    document.getElementById("routine-description").value = "";
    selectedExercises = [];
    loadExerciseChoices();

    renderRoutines();
    renderDashboard();
}

/* ---------------- DELETE ROUTINE (NEW) ---------------- */
function deleteRoutine(name) {
    routines = routines.filter(r => r.name !== name);
    saveData();
    renderRoutines();
    renderDashboard();
}

/* ---------------- RENDER ROUTINES ---------------- */
function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    if (routines.length === 0) {
        list.innerHTML = `<p class="small-text">No routines yet</p>`;
        return;
    }

    routines.forEach(r => {
        list.innerHTML += `
            <div class="routine-card">
                <div>
                    <h3>${r.name}</h3>
                    <p class="small-text">${r.description || ""}</p>
                    <p class="small-text">${r.exercises.length} exercises</p>
                </div>
                <div class="button-group">
                    <button class="green-btn" onclick="startRoutine('${r.name}')">Start</button>
                    <button class="dark-btn" onclick="deleteRoutine('${r.name}')">Delete</button>
                </div>
            </div>
        `;
    });
}

/* ---------------- RENDER EXERCISES ---------------- */
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

/* ---------------- START WORKOUT ---------------- */
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

/* ---------------- SHOW WORKOUT PAGE ---------------- */
function showWorkoutPage() {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("workout").classList.add("active");
}

/* ---------------- RENDER WORKOUT ---------------- */
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
                    <button class="dark-btn" onclick="startRestTimer(${exIndex})">Rest</button>
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

/* ---------------- SETS ---------------- */
function updateSet(exIndex, setIndex, field, value) {
    currentWorkout.exercises[exIndex].sets[setIndex][field] = value;
}

function addSet(exIndex) {
    currentWorkout.exercises[exIndex].sets.push({ weight: "", reps: "" });
    renderWorkout();
}

/* ---------------- TIMER ---------------- */
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

/* ---------------- FINISH WORKOUT ---------------- */
function finishWorkout() {
    const duration = Math.max(1, Math.floor((Date.now() - currentWorkout.startTime) / 60000));

    history.unshift({
        name: currentWorkout.name,
        date: new Date().toLocaleDateString(),
        duration: duration
    });

    saveData();

    currentWorkout = null;
    clearInterval(timerInterval);

    renderDashboard();
    renderHistory();
    showPage("dashboard");
}

/* ---------------- CANCEL ---------------- */
function cancelWorkout() {
    currentWorkout = null;
    clearInterval(timerInterval);
    showPage("dashboard");
}

/* ---------------- HISTORY ---------------- */
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

/* ---------------- DASHBOARD ---------------- */
function renderDashboard() {
    document.getElementById("total-routines").textContent = routines.length;
    document.getElementById("total-workouts").textContent = history.length;
}

/* ---------------- INIT ---------------- */
window.onload = function () {
    renderRoutines();
    renderDashboard();
    renderHistory();
    showPage("dashboard");
};
