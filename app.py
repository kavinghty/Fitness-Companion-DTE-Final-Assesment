from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)


def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def home():
    return render_template("index.html")


# -------------------------------
# GET EXERCISES
# -------------------------------
@app.route("/api/exercises")
def get_exercises():
    conn = get_db_connection()
    exercises = conn.execute("SELECT * FROM Exercise").fetchall()
    conn.close()

    return jsonify([dict(row) for row in exercises])


# -------------------------------
# GET ROUTINES + THEIR EXERCISES
# -------------------------------
@app.route("/api/routines")
def get_routines():
    conn = get_db_connection()

    routines = conn.execute("SELECT * FROM Routines").fetchall()

    result = []

    for r in routines:
        exercises = conn.execute("""
            SELECT e.Exercise_ID, e.Name
            FROM Routine_Exercise re
            JOIN Exercise e ON re.Exercise_ID = e.Exercise_ID
            WHERE re.Routine_ID = ?
        """, (r["ROUTINE_ID"],)).fetchall()

        result.append({
            "id": r["ROUTINE_ID"],
            "name": r["ROUTINE_NAME"],
            "description": r["DESCRIPTION"] if r["DESCRIPTION"] else "",
            "exercises": [dict(ex) for ex in exercises]
        })

    conn.close()
    return jsonify(result)


# -------------------------------
# ADD ROUTINE
# -------------------------------
@app.route("/api/add_routine", methods=["POST"])
def add_routine():
    data = request.get_json()

    name = data.get("name")
    description = data.get("description", "")
    exercise_ids = data.get("exercises", [])

    if not name or len(exercise_ids) == 0:
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO Routines (USER_ID, ROUTINE_NAME, DESCRIPTION) VALUES (?, ?, ?)",
        (1, name, description)
    )

    routine_id = cursor.lastrowid

    for i, ex_id in enumerate(exercise_ids):
        cursor.execute("""
            INSERT INTO Routine_Exercise 
            (Routine_ID, Exercise_ID, Rest_Time, Routine_Order, Routine_Sets, Routine_Reps)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (routine_id, ex_id, 60, i + 1, 3, 10))

    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


# -------------------------------
# DELETE ROUTINE
# -------------------------------
@app.route("/api/delete_routine/<int:routine_id>", methods=["DELETE"])
def delete_routine(routine_id):
    conn = get_db_connection()

    conn.execute("DELETE FROM Routine_Exercise WHERE Routine_ID = ?", (routine_id,))
    conn.execute("DELETE FROM Routines WHERE ROUTINE_ID = ?", (routine_id,))

    conn.commit()
    conn.close()

    return jsonify({"status": "deleted"})


# -------------------------------
# DEBUG ROUTE (VERY IMPORTANT)
# -------------------------------
@app.route("/test")
def test():
    return "Flask is working"


if __name__ == "__main__":
    app.run(debug=True)
