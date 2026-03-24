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
}

let routines = [];

function toggleForm() {
    const form = document.getElementById("routine-form");
    form.classList.toggle("hidden");
}

function addRoutine() {
    const name = document.getElementById("routine-name").value.trim();

    if (name === "") return;

    routines.push(name);
    renderRoutines();
    document.getElementById("routine-name").value = "";
}

function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    routines.forEach((routine, index) => {
        list.innerHTML += `
            <div class="routine-item">
                <p>${routine}</p>
            </div>
        `;
    });
}

window.onload = function() {
    showPage("dashboard");
}