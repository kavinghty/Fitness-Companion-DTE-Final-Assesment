import sqlite3

connection = sqlite3.connect("database.db")
connection.execute("PRAGMA foreign_keys = ON")

with open("schema.sql", "r") as f:
    sql_script = f.read()

connection.executescript(sql_script)
    
connection.commit()

print ("Database setup complete.")

cursor = connection.cursor()


cursor.execute("INSERT INTO Users(FNAME, LNAME, EMAIL, PASSWORD) VALUES ('Kavin', 'Thomson', 'kavin.thomson@gmail.com', 'password123')")
cursor.execute("Select * FROM Users")
result = cursor.fetchall()


for row in result:
    print(row)

connection.close()