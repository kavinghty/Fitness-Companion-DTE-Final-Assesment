from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def home():
    conn = get_db_connection()

    user = conn.execute("SELECT * FROM Users LIMIT 1").fetchone()

    routines = conn.execute("SELECT * FROM Routines").fetchall()
    exercises = conn.execute("SELECT * FROM Exercise").fetchall()

    history = conn.execute("""
        SELECT Workout_Log.Session_ID, Workout_Log.Date, Routines.ROUTINE_NAME
        FROM Workout_Log
        JOIN Routines ON Workout_Log.Routine_ID = Routines.ROUTINE_ID
        ORDER BY Workout_Log.Session_ID DESC
    """).fetchall()

    conn.close()

    # ✅ CONVERT EVERYTHING TO DICTS
    routines = [dict(r) for r in routines]
    exercises = [dict(e) for e in exercises]
    history = [dict(h) for h in history]

    return render_template(
        "index.html",
        user=user,
        routines=routines,
        exercises=exercises,
        history=history
    )



@app.route("/get_routine/<int:id>")
def get_routine(id):
    conn = get_db_connection()

    routine = conn.execute(
        "SELECT ROUTINE_NAME FROM Routines WHERE ROUTINE_ID = ?",
        (id,)
    ).fetchone()

    exercises = conn.execute("""
        SELECT e.Exercise_ID, e.Name, re.Rest_Time
        FROM Routine_Exercise re
        JOIN Exercise e ON re.Exercise_ID = e.Exercise_ID
        WHERE re.Routine_ID = ?
    """, (id,)).fetchall()

    conn.close()

    return jsonify({
        "id": id,
        "name": routine["ROUTINE_NAME"],
        "exercises": [dict(e) for e in exercises]
    })


@app.route("/add_routine", methods=["POST"])
def add_routine():
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO Routines (USER_ID, ROUTINE_NAME, DESCRIPTION) VALUES (?, ?, ?)",
        (1, data["name"], data["description"])
    )

    routine_id = cursor.lastrowid

    for ex_id in data["exercises"]:
        cursor.execute("""
            INSERT INTO Routine_Exercise
            (Routine_ID, Exercise_ID, Rest_Time, Routine_Order, Routine_Sets, Routine_Reps)
            VALUES (?, ?, 60, 1, 3, 10)
        """, (routine_id, ex_id))

    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


@app.route("/delete_routine/<int:id>", methods=["DELETE"])
def delete_routine(id):
    conn = get_db_connection()

    conn.execute("DELETE FROM Routine_Exercise WHERE Routine_ID = ?", (id,))
    conn.execute("DELETE FROM Routines WHERE ROUTINE_ID = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({"status": "deleted"})


@app.route("/save_workout", methods=["POST"])
def save_workout():
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO Workout_Log (User_ID, Routine_ID, Date) VALUES (?, ?, DATE('now'))",
        (1, data["routine_id"])
    )

    session_id = cursor.lastrowid

    for ex in data["exercises"]:
        cursor.execute("""
            INSERT INTO Workout_Set (Session_ID, Exercise_ID, Reps, Weight)
            VALUES (?, ?, ?, ?)
        """, (session_id, ex["Exercise_ID"], 10, 50))

    conn.commit()
    conn.close()

    return jsonify({"status": "saved"})


if __name__ == "__main__":
    app.run(debug=True)
