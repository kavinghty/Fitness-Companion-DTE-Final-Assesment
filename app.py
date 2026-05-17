# =============================================
# File:    app.py
# Purpose: Main Flask application - handles all
#          routes and database queries for
#          Fitness Companion
# Author:  Kavinghty
# Updated: May 2026
# =============================================

import sqlite3
from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta

app = Flask(__name__)


# Opens a connection to the database
def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


# Home page - loads all workouts and routines
@app.route("/")
def index():
    db = get_db()
    workouts = db.execute("""
        SELECT wl.Session_ID, wl.Routine_ID, wl.Date,
               r.ROUTINE_NAME AS routine_name,
               r.DESCRIPTION AS description
        FROM Workout_Log wl
        LEFT JOIN Routines r ON wl.Routine_ID = r.ROUTINE_ID
        ORDER BY wl.Date DESC
    """).fetchall()
    routines = db.execute("SELECT ROUTINE_ID, ROUTINE_NAME FROM Routines").fetchall()
    db.close()
    return render_template("index.html",
        workouts=[dict(w) for w in workouts],
        routines=[dict(r) for r in routines]
    )


# Saves a new workout to the database
@app.route("/add_workout", methods=["POST"])
def add_workout():
    data = request.get_json()
    routine_id = data.get("routine_id")
    date = data.get("date")
    if not routine_id or not date:
        return jsonify({"error": "Please fill in all fields"}), 400
    db = get_db()
    db.execute("INSERT INTO Workout_Log (User_ID, Routine_ID, Date) VALUES (1, ?, ?)", (routine_id, date))
    db.commit()
    new_workout = db.execute("""
        SELECT wl.Session_ID, wl.Routine_ID, wl.Date,
               r.ROUTINE_NAME AS routine_name,
               r.DESCRIPTION AS description
        FROM Workout_Log wl
        LEFT JOIN Routines r ON wl.Routine_ID = r.ROUTINE_ID
        WHERE wl.Session_ID = last_insert_rowid()
    """).fetchone()
    db.close()
    return jsonify(dict(new_workout)), 201


# Deletes a workout from the database
@app.route("/delete_workout/<int:id>", methods=["DELETE"])
def delete_workout(id):
    db = get_db()
    db.execute("DELETE FROM Workout_Set WHERE Session_ID = ?", (id,))
    db.execute("DELETE FROM Workout_Log WHERE Session_ID = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"ok": True})


# Routines page - loads all routines
@app.route("/routines")
def routines():
    db = get_db()
    rows = db.execute("SELECT * FROM Routines ORDER BY ROUTINE_NAME").fetchall()
    db.close()
    return render_template("routines.html", routines=[dict(r) for r in rows])


# Saves a new routine to the database
@app.route("/create_routine", methods=["POST"])
def create_routine():
    data = request.get_json()
    name = data.get("name", "").strip()
    desc = data.get("description", "").strip()
    if not name:
        return jsonify({"error": "Please enter a routine name"}), 400
    db = get_db()
    db.execute("INSERT INTO Routines (USER_ID, ROUTINE_NAME, DESCRIPTION) VALUES (1, ?, ?)", (name, desc))
    db.commit()
    new = db.execute("SELECT * FROM Routines WHERE ROUTINE_ID = last_insert_rowid()").fetchone()
    db.close()
    return jsonify(dict(new)), 201


# Deletes a routine and its exercises from the database
@app.route("/delete_routine/<int:id>", methods=["DELETE"])
def delete_routine(id):
    db = get_db()
    db.execute("DELETE FROM Routine_Exercise WHERE Routine_ID = ?", (id,))
    db.execute("DELETE FROM Routines WHERE ROUTINE_ID = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"ok": True})


# Single routine page - loads exercises for that routine
@app.route("/routines/<int:id>")
def routine_detail(id):
    db = get_db()
    routine = db.execute("SELECT * FROM Routines WHERE ROUTINE_ID = ?", (id,)).fetchone()
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
    all_exercises = db.execute("SELECT Exercise_ID, Name FROM Exercise ORDER BY Name").fetchall()
    db.close()
    return render_template("routine_detail.html",
        routine=dict(routine),
        exercises=[dict(e) for e in exercises],
        all_exercises=[dict(e) for e in all_exercises]
    )


# Adds an exercise to a routine
@app.route("/add_exercise_to_routine", methods=["POST"])
def add_exercise_to_routine():
    data = request.get_json()
    routine_id = data.get("routine_id")
    exercise_id = data.get("exercise_id")
    sets = data.get("sets", 3)
    reps = data.get("reps", 10)
    rest = data.get("rest_time", 60)
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


# Removes an exercise from a routine
@app.route("/remove_exercise/<int:id>", methods=["DELETE"])
def remove_exercise(id):
    db = get_db()
    db.execute("DELETE FROM Routine_Exercise WHERE Routine_Exercise_ID = ?", (id,))
    db.commit()
    db.close()
    return jsonify({"ok": True})


# Stats page - counts workouts and builds chart data
@app.route("/stats")
def stats():
    db = get_db()
    total_workouts = db.execute("SELECT COUNT(*) FROM Workout_Log").fetchone()[0]
    total_routines = db.execute("SELECT COUNT(*) FROM Routines").fetchone()[0]
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    this_week = db.execute("SELECT COUNT(*) FROM Workout_Log WHERE Date >= ?", (week_ago,)).fetchone()[0]
    month_start = datetime.now().strftime("%Y-%m-01")
    this_month = db.execute("SELECT COUNT(*) FROM Workout_Log WHERE Date >= ?", (month_start,)).fetchone()[0]
    chart_data = []
    for i in range(6, -1, -1):
        day = datetime.now() - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        count = db.execute("SELECT COUNT(*) FROM Workout_Log WHERE Date LIKE ?", (day_str + "%",)).fetchone()[0]
        chart_data.append({"day": day.strftime("%a"), "count": count})
    db.close()
    return render_template("stats.html",
        total_workouts=total_workouts,
        total_routines=total_routines,
        this_week=this_week,
        this_month=this_month,
        chart_data=chart_data
    )


if __name__ == "__main__":
    app.run(debug=True)