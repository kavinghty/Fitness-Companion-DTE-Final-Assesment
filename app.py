import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


# Opens a connection to the database
def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


# Home page
@app.route("/")
def index():
    db = get_db()
    workouts = db.execute("""
        SELECT wl.Session_ID, wl.Routine_ID, wl.Date,
               r.ROUTINE_NAME AS routine_name,
               r.DESCRIPTION  AS description
        FROM Workout_Log wl
        LEFT JOIN Routines r ON wl.Routine_ID = r.ROUTINE_ID
        ORDER BY wl.Date DESC
    """).fetchall()
    routines = db.execute("SELECT ROUTINE_ID, ROUTINE_NAME FROM Routines").fetchall()
    db.close()
    return render_template("index.html",
        workouts=[dict(w) for w in workouts],
        routines =[dict(r) for r in routines]
    )


# Save a new workout
@app.route("/add_workout", methods=["POST"])
def add_workout():
    data = request.get_json()
    routine_id = data.get("routine_id")
    date = data.get("date")
    if not routine_id or not date:
        return jsonify({"error": "Please fill in all fields"}), 400
    db = get_db()
    db.execute(
        "INSERT INTO Workout_Log (User_ID, Routine_ID, Date) VALUES (1, ?, ?)",
        (routine_id, date)
    )
    db.commit()
    new = db.execute("""
        SELECT wl.Session_ID, wl.Routine_ID, wl.Date,
               r.ROUTINE_NAME AS routine_name,
               r.DESCRIPTION  AS description
        FROM Workout_Log wl
        LEFT JOIN Routines r ON wl.Routine_ID = r.ROUTINE_ID
        WHERE wl.Session_ID = last_insert_rowid()
    """).fetchone()
    db.close()
    return jsonify(dict(new)), 201


# Delete a workout
@app.route("/delete_workout/<int:id>", methods=["DELETE"])
def delete_workout(id):
    db = get_db()
    db.execute("DELETE FROM Workout_Set  WHERE Session_ID = ?", (id,))
    db.execute("DELETE FROM Workout_Log  WHERE Session_ID = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"ok": True})


# Routines page
@app.route("/routines")
def routines():
    db = get_db()
    rows = db.execute("SELECT * FROM Routines ORDER BY ROUTINE_NAME").fetchall()
    db.close()
    return render_template("routines.html",routines=[dict(r) for r in rows])


# Save a new routine
@app.route("/create_routine", methods=["POST"])
def create_routine():
    data = request.get_json()
    name = data.get("name", "").strip()
    desc = data.get("description","").strip()
    if not name:
        return jsonify({"error": "Please enter a routine name"}), 400
    db = get_db()
    db.execute(
        "INSERT INTO Routines (USER_ID, ROUTINE_NAME, DESCRIPTION) VALUES (1, ?, ?)",
        (name, desc)
    )
    db.commit()
    new = db.execute("SELECT * FROM Routines WHERE ROUTINE_ID = last_insert_rowid()").fetchone()
    db.close()
    return jsonify(dict(new)), 201


# Delete a routine
@app.route("/delete_routine/<int:id>", methods=["DELETE"])
def delete_routine(id):
    db = get_db()
    db.execute("DELETE FROM Routine_Exercise WHERE Routine_ID  = ?", (id,))
    db.execute("DELETE FROM Routines          WHERE ROUTINE_ID = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"ok": True})


# Single routine page
@app.route("/routines/<int:id>")
def routine_detail(id):
    db = get_db()
    routine = db.execute(
        "SELECT * FROM Routines WHERE ROUTINE_ID = ?", (id,)
    ).fetchone()
    if not routine:
        return "Routine not found", 404
    exercises = db.execute("""
        SELECT re.Routine_Exercise_ID, re.Routine_Sets, re.Routine_Reps,
               re.Rest_Time, e.Name AS exercise_name
        FROM Routine_Exercise re
        JOIN Exercise e ON re.Exercise_ID = e.Exercise_ID
        WHERE re.Routine_ID = ?
        ORDER BY re.Routine_Order
    """, (id,)).fetchall()
    all_exercises = db.execute(
        "SELECT Exercise_ID, Name FROM Exercise ORDER BY Name"
    ).fetchall()
    db.close()
    return render_template("routine_detail.html",
        routine=dict(routine),
        exercises =  [dict(e) for e in exercises],
        all_exercises=[dict(e) for e in all_exercises]
    )


# Add an exercise to a routine
@app.route("/add_exercise_to_routine", methods=["POST"])
def add_exercise_to_routine():
    data = request.get_json()
    routine_id  = data.get("routine_id")
    exercise_id = data.get("exercise_id")
    sets  = data.get("sets", 3)
    reps  = data.get("reps", 10)
    rest  = data.get("rest_time", 60)
    order = data.get("order", 1)
    if not routine_id or not exercise_id:
        return jsonify({"error": "Missing fields"}), 400
    db = get_db()
    db.execute("""
        INSERT INTO Routine_Exercise
            (Routine_ID, Exercise_ID, Rest_Time, Routine_Order, Routine_Sets, Routine_Reps)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (routine_id, exercise_id, rest, order, sets, reps))
    db.commit()
    new = db.execute("""
        SELECT re.Routine_Exercise_ID, re.Routine_Sets, re.Routine_Reps,
               re.Rest_Time, e.Name AS exercise_name
        FROM Routine_Exercise re
        JOIN Exercise e ON re.Exercise_ID = e.Exercise_ID
        WHERE re.Routine_Exercise_ID = last_insert_rowid()
    """).fetchone()
    db.close()
    return jsonify(dict(new)), 201


# Remove an exercise from a routine
@app.route("/remove_exercise/<int:id>", methods=["DELETE"])
def remove_exercise(id):
    db = get_db()
    db.execute("DELETE FROM Routine_Exercise WHERE Routine_Exercise_ID = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True)