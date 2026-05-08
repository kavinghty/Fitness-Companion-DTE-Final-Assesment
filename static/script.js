// get workouts from the page
var workouts = JSON.parse(document.getElementById("workout-data").textContent);

// runs when page loads
document.addEventListener("DOMContentLoaded", function () {

  // show todays date
  var now = new Date();
  var dateText = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  document.getElementById("date-label").textContent = dateText.toUpperCase();

  // fill in todays date and time
  document.getElementById("input-date").value = getDateStr(now);
  document.getElementById("input-time").value = getTimeStr(now);

  showWorkouts();

});


// draws the workout list
function showWorkouts() {

  var list = document.getElementById("workout-list");
  list.innerHTML = "";

  if (workouts.length === 0) {
    list.innerHTML = '<div class="empty"><p>No workouts logged yet</p></div>';
    document.getElementById("stat-workouts").textContent = "0";
    document.getElementById("stat-minutes").textContent = "0";
    return;
  }

  var todayStr = getDateStr(new Date());
  var count = 0;

  workouts.forEach(function (w) {

    if (w.Date && w.Date.startsWith(todayStr)) {
      count = count + 1;
    }

    var row = document.createElement("div");
    row.className = "workout-row";

    var name = w.routine_name || "Workout";
    var type = w.description || "";
    var dateText = niceDate(w.Date);
    var routine_id = w.Routine_ID;

    var nameHtml;
    if (routine_id) {
      nameHtml = '<a href="/routines/' + routine_id + '" class="link-name">' + safe(name) + '</a>';
    } else {
      nameHtml = safe(name);
    }

    row.innerHTML =
      '<div class="workout-left">' +
        '<div class="workout-dot"></div>' +
        '<div>' +
          '<div class="workout-name">' + nameHtml + '</div>' +
          '<div class="workout-meta">' + safe(dateText) + (type ? ' · ' + safe(type) : '') + '</div>' +
        '</div>' +
      '</div>' +
      '<button class="delete-btn" onclick="deleteWorkout(' + w.Session_ID + ')">✕</button>';

    list.appendChild(row);

  });

  document.getElementById("stat-workouts").textContent = count;
  document.getElementById("stat-minutes").textContent = "0";

}


function openForm() {
  document.getElementById("form-sheet").classList.add("open");
  document.getElementById("log-btn").style.display = "none";
  document.getElementById("error-msg").textContent = "";
}

function closeForm() {
  document.getElementById("form-sheet").classList.remove("open");
  document.getElementById("log-btn").style.display = "inline-flex";
}


function addWorkout() {

  var routineId = document.getElementById("input-routine").value;
  var date = document.getElementById("input-date").value;
  var time = document.getElementById("input-time").value;

  if (!routineId) {
    document.getElementById("error-msg").textContent = "Please pick a routine.";
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
  .then(function (data) {
    if (data.error) {
      document.getElementById("error-msg").textContent = data.error;
      return;
    }
    workouts.unshift(data);
    showWorkouts();
    closeForm();
    document.getElementById("input-routine").value = "";
  })
  .catch(function () {
    document.getElementById("error-msg").textContent = "Something went wrong.";
  });

}


function deleteWorkout(id) {

  if (!confirm("Delete this workout?")) return;

  fetch("/delete_workout/" + id, { method: "DELETE" })
  .then(function (res) { return res.json(); })
  .then(function () {
    workouts = workouts.filter(function (w) { return w.Session_ID !== id; });
    showWorkouts();
  });

}


// turns "2026-05-06 18:00:00" into "Today · 6:00 PM"
function niceDate(str) {

  if (!str) return "";

  var d = new Date(str.replace(" ", "T"));
  if (isNaN(d)) return str;

  var todayStr = getDateStr(new Date());
  var yesterdayStr = getDateStr(new Date(Date.now() - 86400000));
  var thisDate = getDateStr(d);

  var label;
  if (thisDate === todayStr) {
    label = "Today";
  } else if (thisDate === yesterdayStr) {
    label = "Yesterday";
  } else {
    label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return label + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

}


// returns YYYY-MM-DD
function getDateStr(d) {
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// returns HH:MM
function getTimeStr(d) {
  var hrs = String(d.getHours()).padStart(2, "0");
  var mins = String(d.getMinutes()).padStart(2, "0");
  return hrs + ":" + mins;
}

// stops special characters breaking the page
function safe(str) {
  if (!str) return "";
  var s = String(str);
  s = s.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/"/g, "&quot;");
  return s;
}