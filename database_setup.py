import sqlite3

connection = sqlite3.connect("database.db")
connection.execute("PRAGMA foreign_keys = ON")
cursor = connection.cursor()

# Run schema
with open("schema.sql", "r") as f:
    connection.executescript(f.read())

# =========================
# INSERT USER (SAFE)
# =========================
user = cursor.execute("SELECT * FROM Users").fetchone()

if not user:
    cursor.execute("""
        INSERT INTO Users (FNAME, LNAME, EMAIL, PASSWORD)
        VALUES (?, ?, ?, ?)
    """, ("Kavin", "Thomson", "kavin.thomson@gmail.com", "password123"))

# Get USER_ID
user_id = cursor.execute("SELECT USER_ID FROM Users LIMIT 1").fetchone()[0]

# =========================
# INSERT EXERCISE TYPES
# =========================
types_exist = cursor.execute("SELECT COUNT(*) FROM Exercise_Type").fetchone()[0]

if types_exist == 0:
    cursor.executemany("""
        INSERT INTO Exercise_Type (Name, Description) VALUES (?, ?)
    """, [
        ("Chest", "Chest exercises"),
        ("Legs", "Leg exercises"),
        ("Back", "Back exercises"),
        ("Arms", "Arm exercises"),
        ("Shoulders", "Shoulder exercises")
    ])

# =========================
# INSERT EXERCISES
# =========================
exercise_exist = cursor.execute("SELECT COUNT(*) FROM Exercise").fetchone()[0]

if exercise_exist == 0:
    cursor.executemany("""
        INSERT INTO Exercise (User_ID, ExerciseType_ID, Name, Description)
        VALUES (?, ?, ?, ?)
    """, [
        (user_id, 1, "Bench Press", "Chest press movement"),
        (user_id, 2, "Squats", "Leg strength"),
        (user_id, 3, "Deadlift", "Full body pull"),
        (user_id, 3, "Pull Ups", "Back pull"),
        (user_id, 5, "Shoulder Press", "Overhead press"),
        (user_id, 4, "Bicep Curls", "Arm isolation")
    ])

connection.commit()

print("Database setup complete.")

connection.close()
