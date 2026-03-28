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
}

let routines = [];
let history = [];
let selectedExercises = [];
let currentWorkout = null;

let timerInterval = null;
let timeLeft = 0;

const exercises = [
    { id: 1, name: "Bench Press" },
    { id: 2, name: "Squats" },
    { id: 3, name: "Deadlift" },
    { id: 4, name: "Pull Ups" },
    { id: 5, name: "Shoulder Press" },
    { id: 6, name: "Bicep Curls" }
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

    if (name === "" || selectedExercises.length === 0) return;

    routines.unshift({
        name,
        exercises: [...selectedExercises]
    });

    renderRoutines();
    renderDashboard();
    selectedExercises = [];
}

function startRoutine(name) {
    const routine = routines.find(r => r.name === name);

    currentWorkout = {
        name: routine.name,
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
                    <input type="number" placeholder="Weight" value="${set.weight}"
                        onchange="updateSet(${exIndex}, ${setIndex}, 'weight', this.value)">
                    <input type="number" placeholder="Reps" value="${set.reps}"
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
                <button onclick="addSet(${exIndex})">Add Set</button>
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

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
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

function cancelWorkout() {
    currentWorkout = null;
    clearInterval(timerInterval);
    showPage("dashboard");
}

function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    routines.forEach(r => {
        list.innerHTML += `
            <div class="routine-card">
                <h3>${r.name}</h3>
                <button onclick="startRoutine('${r.name}')">Start</button>
            </div>
        `;
    });
}

function renderDashboard() {
    document.getElementById("total-routines").textContent = routines.length;
}

window.onload = function() {
    showPage("dashboard");
}
