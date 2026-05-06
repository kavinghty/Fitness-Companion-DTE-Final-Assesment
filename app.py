import sqlite3
from flask import Flask, render_template

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


if __name__ == "__main__":
    app.run(debug=True)