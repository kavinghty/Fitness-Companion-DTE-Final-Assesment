function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(p => p.style.display = "none");

    document.getElementById(pageId).style.display = "block";
}

let routines = [];

function toggleForm() {
    const form = document.getElementById("routine-form");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

function addRoutine() {
    const name = document.getElementById("routine-name").value;

    if (name === "") return;

    routines.push(name);
    renderRoutines();
    document.getElementById("routine-name").value = "";
}

function renderRoutines() {
    const list = document.getElementById("routine-list");
    list.innerHTML = "";

    routines.forEach(r => {
        list.innerHTML += `<p>${r}</p>`;
    });
}

window.onload = function() {
    showPage("dashboard");
}