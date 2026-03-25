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
}

let routines = [];
let history = [];

function toggleForm() {
    document.getElementById("routine-form").classList.toggle("hidden");
}

function addRoutine() {
    const name = document.getElementById("routine-name").value.trim();

    if (name === "") return;

    routines.push(name);
    renderRoutines();
    document.getElementById("routine-name").value = "";
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
                    <h3>${routine}</h3>
                </div>
                <div class="button-group">
                    <button class="green-btn" onclick="startRoutine('${routine}')">Start</button>
                    <button class="dark-btn" onclick="deleteRoutine(${index})">Delete</button>
                </div>
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
