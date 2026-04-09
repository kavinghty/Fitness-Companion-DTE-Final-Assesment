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
}


let routines = JSON.parse(localStorage.getItem("routines")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

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


function saveData() {
    localStorage.setItem("routines", JSON.stringify(routines));
    localStorage.setItem("history", JSON.stringify(history));
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


function addRoutine() {
    const name = document.getElementById("routine-name").value.trim();

    if (name === "" || selectedExercises.length === 0) return;

    routines.unshift({
        name,
        exercises: [...selectedExercises]
    });

    saveData();

    renderRoutines();
    renderDashboard();
    selectedExercises = [];

    document.getElementById("routine-form").classList.add("hidden");
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

    // ✅ FIX: Always pull latest rest time
    timeLeft = Number(currentWorkout.exercises[exIndex].restTime);

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
        duration: duration
    });

    saveData();

    currentWorkout = null;
    clearInterval(timerInterval);

    renderDashboard();
    renderHistory();
    showPage("dashboard");
}


function cancelWorkout() {
    currentWorkout = null;
    clearInterval(timerInterval);
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


function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    routines.forEach(r => {
        list.innerHTML += `
            <div class="routine-card">
                <div>
                    <h3>${r.name}</h3>
                    <p class="small-text">${r.exercises.length} exercises</p>
                </div>

                <div class="button-group">
                    <button class="green-btn" onclick="startRoutine('${r.name}')">Start</button>
                </div>
            </div>
        `;
    });
}


function renderDashboard() {
    document.getElementById("total-routines").textContent = routines.length;
    document.getElementById("total-workouts").textContent = history.length;
}


window.onload = function() {
    renderRoutines();
    renderDashboard();
    renderHistory();
    showPage("dashboard");
};
