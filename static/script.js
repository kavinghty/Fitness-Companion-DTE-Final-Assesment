// load workouts from the page
var workouts = JSON.parse(document.getElementById("workout-data").textContent);

// runs when the page loads
document.addEventListener("DOMContentLoaded", function () {

  var now = new Date();

  // show the date at the top
  var dateText = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  document.getElementById("date-label").textContent = dateText.toUpperCase();

  // fill in todays date and time in the form
  document.getElementById("input-date").value = getDateStr(now);
  document.getElementById("input-time").value = getTimeStr(now);

  showWorkouts();

});


// draws all the workouts on the page
function showWorkouts() {

  var list = document.getElementById("workout-list");
  list.innerHTML = "";

  // no workouts yet
  if (workouts.length === 0) {
    list.innerHTML = '<div class="empty"><p>No workouts logged yet</p></div>';
    document.getElementById("stat-workouts").textContent = "0";
    document.getElementById("stat-minutes").textContent = "0";
    return;
  }

  var todayStr = getDateStr(new Date());
  var count = 0;

  // loop through each workout and make a row
  var i = 0;
  while (i < workouts.length) {

    var w = workouts[i];

    // check if this workout is from today
    if (w.Date && w.Date.startsWith(todayStr)) {
      count = count + 1;
    }

    var row = document.createElement("div");
    row.className = "workout-row";

    // get the name and description
    var name = w.routine_name;
    if (name === null || name === undefined) {
      name = "Workout";
    }

    var type = w.description;
    if (type === null || type === undefined) {
      type = "";
    }

    var dateText = niceDate(w.Date);
    var routine_id = w.Routine_ID;

    // make the name a link if we have a routine id
    var nameHtml;
    if (routine_id) {
      nameHtml = '<a href="/routines/' + routine_id + '" class="link-name">' + safe(name) + '</a>';
    } else {
      nameHtml = safe(name);
    }

    // build the date and description text
    var metaText = safe(dateText);
    if (type !== "") {
      metaText = metaText + " · " + safe(type);
    }

    // build the row html
    row.innerHTML =
      '<div class="workout-left">' +
        '<div class="workout-dot"></div>' +
        '<div>' +
          '<div class="workout-name">' + nameHtml + '</div>' +
          '<div class="workout-meta">' + metaText + '</div>' +
        '</div>' +
      '</div>' +
      '<button class="delete-btn" onclick="deleteWorkout(' + w.Session_ID + ')">✕</button>';

    list.appendChild(row);
    i = i + 1;

  }

  // update the stats
  document.getElementById("stat-workouts").textContent = count;
  document.getElementById("stat-minutes").textContent = "0";

}


// opens the form
function openForm() {
  document.getElementById("form-sheet").classList.add("open");
  document.getElementById("log-btn").style.display = "none";
  document.getElementById("error-msg").textContent = "";
}

// closes the form
function closeForm() {
  document.getElementById("form-sheet").classList.remove("open");
  document.getElementById("log-btn").style.display = "inline-flex";
}


// saves a new workout to the database
function addWorkout() {

  var routineId = document.getElementById("input-routine").value;
  var date = document.getElementById("input-date").value;
  var time = document.getElementById("input-time").value;

  // check each field is filled in
  if (routineId === "") {
    document.getElementById("error-msg").textContent = "Please pick a routine.";
    return;
  }

  if (date === "") {
    document.getElementById("error-msg").textContent = "Please enter a date.";
    return;
  }

  if (time === "") {
    document.getElementById("error-msg").textContent = "Please enter a time.";
    return;
  }

  // combine date and time
  var datetime = date + " " + time + ":00";

  // send to flask
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

    // add to the top of the list and redraw
    workouts.unshift(data);
    showWorkouts();
    closeForm();
    document.getElementById("input-routine").value = "";

  })
  .catch(function () {
    document.getElementById("error-msg").textContent = "Something went wrong.";
  });

}


// deletes a workout
function deleteWorkout(id) {

  var answer = confirm("Delete this workout?");
  if (answer === false) {
    return;
  }

  fetch("/delete_workout/" + id, { method: "DELETE" })
  .then(function (res) {
    return res.json();
  })
  .then(function () {

    // build a new list without the deleted workout
    var newList = [];
    var i = 0;
    while (i < workouts.length) {
      if (workouts[i].Session_ID !== id) {
        newList.push(workouts[i]);
      }
      i = i + 1;
    }
    workouts = newList;
    showWorkouts();

  });

}


// formats a date string into something readable like Today 6:00 PM
function niceDate(str) {

  if (str === null || str === undefined || str === "") {
    return "";
  }

  var d = new Date(str.replace(" ", "T"));
  if (isNaN(d)) {
    return str;
  }

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

  var time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return label + " · " + time;

}


// returns the date as YYYY-MM-DD
function getDateStr(d) {
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}


// returns the time as HH:MM
function getTimeStr(d) {
  var hrs = String(d.getHours()).padStart(2, "0");
  var mins = String(d.getMinutes()).padStart(2, "0");
  return hrs + ":" + mins;
}


// makes text safe to put inside html
function safe(str) {
  if (str === null || str === undefined || str === "") {
    return "";
  }
  var s = String(str);
  s = s.replace(/&/g, "&amp;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/"/g, "&quot;");
  return s;
}