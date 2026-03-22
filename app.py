from flask import Flask, render_template
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

    conn.close()

    return render_template(
        "index.html",
        user=user,
        routines=routines,
        exercises=exercises
    )

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)