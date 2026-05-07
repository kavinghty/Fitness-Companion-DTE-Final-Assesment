// get workouts from the page
var workouts = JSON.parse(document.getElementById("workout-data").textContent);

// runs when page loads
document.addEventListener("DOMContentLoaded", function () {

  var now = new Date();

  // show the date at the top
  var dateText = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  document.getElementById("date-label").textContent = dateText.toUpperCase();

  // set todays date and time in the form
  var today = getDateStr(now);
  var currentTime = getTimeStr(now);
  document.getElementById("input-date").value = today;
    document.getElementById("input-time").value = currentTime;

  showWorkouts();

});


function showWorkouts() {

  var list = document.getElementById("workout-list");
  list.innerHTML = "";

  // if no workouts show a message
  if (workouts.length === 0) {
    list.innerHTML = '<div class="empty"><p>No workouts logged yet</p></div>';
    document.getElementById("stat-workouts").textContent = "0";
    document.getElementById("stat-minutes").textContent = "0";
    return;
  }

  var todayStr = getDateStr(new Date());
  var count = 0;
  var x = 0; // tried using this earlier, forgot to remove

  workouts.forEach(function (w) {

    // count todays workouts
    if (w.Date && w.Date.startsWith(todayStr)) {
      count = count + 1;
    }

    var row = document.createElement("div");
    row.className = "workout-row";

    // get the info we need
    var name = w.routine_name;
    if (!name) {
      name = "Workout";
    }
    var type = w.description || "";
    var dateText = niceDate(w.Date);
    var routine_id = w.Routine_ID;

    // make name a link if we have an id
    var nameHtml;
    if (routine_id) {
      nameHtml = '<a href="/routines/' + routine_id + '" class="link-name">' + safe(name) + '</a>';
    } else {
      nameHtml = safe(name);
    }

    // build the row html
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

  // update stats at top
  document.getElementById("stat-workouts").textContent = count;
  document.getElementById("stat-minutes").textContent = "0"; // TODO: add duration to db later

}


// opens the form
function openForm() {
  document.getElementById("form-sheet").classList.add("open");
  document.getElementById("log-btn").style.display = "none";
  document.getElementById("error-msg").textContent = "";
}

function closeForm() {
  // hide the form and show the button again
  document.getElementById("form-sheet").classList.remove("open");
    document.getElementById("log-btn").style.display = "inline-flex";
}


// this saves the workout to the database
function addWorkout() {

  var routineId = document.getElementById("input-routine").value;
  var date = document.getElementById("input-date").value;
  var time = document.getElementById("input-time").value;

  // make sure fields are filled in
  if (!routineId) {
    document.getElementById("error-msg").textContent = "Please pick a routine.";
    return;
  }

  if (!date || !time) {
    document.getElementById("error-msg").textContent = "Please enter a date and time.";
    return;
  }

  // combine date and time
  var datetime = date + " " + time + ":00";

  fetch("/add_workout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routine_id: parseInt(routineId), date: datetime })
  })
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {

    if (data.error) {
      document.getElementById("error-msg").textContent = data.error;
      return;
    }

    // add to list and close form
    workouts.unshift(data);
    showWorkouts();
    closeForm();

    // reset the routine dropdown
    document.getElementById("input-routine").value = "";

  })
  .catch(function () {
    document.getElementById("error-msg").textContent = "Something went wrong.";
  });

}


function deleteWorkout(id) {

  var confirmed = confirm("Delete this workout?");
  if (!confirmed) return;

  fetch("/delete_workout/" + id, { method: "DELETE" })
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    // remove from the array and redraw
    workouts = workouts.filter(function (w) {
      return w.Session_ID !== id;
    });
    showWorkouts();
  });

}


// formats a date string nicely e.g "Today · 6:00 PM"
function niceDate(str) {

  if (!str) return "";

  // replace the space with T so javascript can read it
  var d = new Date(str.replace(" ", "T"));

  if (isNaN(d)) return str;

  var todayStr = getDateStr(new Date());
  var yesterday = new Date(Date.now() - 86400000);
  var yesterdayStr = getDateStr(yesterday);
  var thisDate = getDateStr(d);

  var label;

  if (thisDate === todayStr) {
    label = "Today";
  } else if (thisDate === yesterdayStr) {
    label = "Yesterday";
  } else {
    label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  var time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return label + " · " + time;

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

// sanitise text before putting it in html
function safe(str) {
  if (str === null || str === undefined || str === "") return "";
  var s = String(str);
  s = s.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/"/g, "&quot;");
  return s;
}

