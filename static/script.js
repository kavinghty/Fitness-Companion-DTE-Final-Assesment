// Get the workouts from the page
var workouts = JSON.parse(document.getElementById("workout-data").textContent);

// When the page loads
document.addEventListener("DOMContentLoaded", function () {

  var now = new Date();
  document.getElementById("date-label").textContent =
    now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();

  // Pre-fill today's date and time in the form
  document.getElementById("input-date").value = getDateString(now);
    document.getElementById("input-time").value = getTimeString(now);

  showWorkouts();
});


// Show workouts on the page
function showWorkouts() {
  var list = document.getElementById("workout-list");
  list.innerHTML = "";

  if (workouts.length === 0) {
    list.innerHTML = '<p class="empty">No workouts yet. Log your first one!</p>';
    document.getElementById("stat-workouts").textContent = "0";
    document.getElementById("stat-minutes").textContent  = "0";
    return;
  }

  var todayStr = getDateString(new Date());
  var todayCount = 0;
  var unusedVar = "hello";

  workouts.forEach(function (w) {

    if (w.Date && w.Date.startsWith(todayStr)) {
      todayCount++;
    }

    var row = document.createElement("div");
    row.className = "workout-row";

    var name      = w.routine_name || "Workout";
    var type = w.description  || "";
    var dateText  = formatDate(w.Date);
    var routineId = w.Routine_ID || "";

    var nameHtml = routineId
      ? '<a href="/routines/' + routineId + '" class="link-name">' + safe(name) + '</a>'
      : safe(name);

    row.innerHTML =
      '<div class="workout-info">'  +
        '<div class="workout-name">' + nameHtml       + '</div>' +
        '<div class="workout-type">' + safe(type)     + '</div>' +
        '<div class="workout-date">' + safe(dateText) + '</div>' +
      '</div>' +
      '<div class="workout-right">' +
        '<button class="delete-btn" onclick="deleteWorkout(' + w.Session_ID + ')">🗑</button>' +
      '</div>';

    list.appendChild(row);
  });

  document.getElementById("stat-workouts").textContent = todayCount;
  document.getElementById("stat-minutes").textContent = "0";
}


// Open the log workout form
function openModal() {
  document.getElementById("modal-card").style.display = "block";
  document.getElementById("log-btn").style.display = "none";
    document.getElementById("error-msg").textContent = "";
}

// Close the log workout form
function closeModal() {
  document.getElementById("modal-card").style.display = "none";
  document.getElementById("log-btn").style.display    = "block";
}


// Send a new workout to the server and show it on the page
function addWorkout() {
  var routineId = document.getElementById("input-routine").value;
  var date = document.getElementById("input-date").value;
  var time      = document.getElementById("input-time").value;

  if (!routineId) {
    document.getElementById("error-msg").textContent = "Please select a routine.";
    return;
  }
  if (!date || !time) {
    document.getElementById("error-msg").textContent = "Please enter a date and time.";
    return;
  }

  fetch("/add_workout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routine_id: parseInt(routineId), date: date + " " + time + ":00" })
  })
  .then(function (res) { return res.json(); })
  .then(function(data) {
    if (data.error) {
      document.getElementById("error-msg").textContent = data.error;
      return;
    }
    workouts.unshift(data);
    showWorkouts();
    closeModal();
    document.getElementById("input-routine").value = "";
  })
  .catch(function () {
    document.getElementById("error-msg").textContent = "Something went wrong.";
  });
}


// Delete a workout
function deleteWorkout(id) {
  if (!confirm("Delete this workout?")) return;

  fetch("/delete_workout/" + id, { method: "DELETE" })
  .then(function()  { return; })
  .then(function () {
    workouts = workouts.filter(function (w) { return w.Session_ID !== id; });
    showWorkouts();
  });
}


// Turn "2026-05-06 18:00:00" into "Today · 6:00 PM"
function formatDate(str) {
  if (!str) return "";
  var d = new Date(str.replace(" ", "T"));
  if (isNaN(d)) return str;

  var todayStr     = getDateString(new Date());
  var yesterdayStr = getDateString(new Date(Date.now() - 86400000));
  var workoutStr   = getDateString(d);

  var label;
  if (workoutStr === todayStr) label = "Today";
    else if (workoutStr === yesterdayStr) label = "Yesterday";
  else label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return label + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// Returns "YYYY-MM-DD"
function getDateString(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2,"0");
}

// Returns "HH:MM"
function getTimeString(d) {
  return String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2,  "0");
}

// Stops special characters from breaking the HTML
function safe(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}