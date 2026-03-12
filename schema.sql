DROP TABLE IF EXISTS Workout_Set;
DROP TABLE IF EXISTS Workout_Log;
DROP TABLE IF EXISTS Routine_Exercise;
DROP TABLE IF EXISTS Exercise;
DROP TABLE IF EXISTS Exercise_Type;
DROP TABLE IF EXISTS Routines;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    USER_ID INTEGER PRIMARY KEY,
    FNAME TEXT NOT NULL,
    LNAME TEXT NOT NULL,
    EMAIL TEXT NOT NULL UNIQUE,
    PASSWORD TEXT
);

CREATE TABLE Routines (
    ROUTINE_ID INTEGER PRIMARY KEY,
    USER_ID INTEGER NOT NULL,
    ROUTINE_NAME TEXT NOT NULL,
    DESCRIPTION TEXT,
    FOREIGN KEY (USER_ID) REFERENCES Users(USER_ID)
);

CREATE TABLE Exercise_Type (
    ExerciseType_ID INTEGER PRIMARY KEY,
    Name TEXT,
    Description TEXT
);

CREATE TABLE Exercise (
    Exercise_ID INTEGER PRIMARY KEY,
    User_ID INTEGER,
    ExerciseType_ID INTEGER,
    Name TEXT,
    Description TEXT,
    FOREIGN KEY (User_ID) REFERENCES Users(USER_ID),
    FOREIGN KEY (ExerciseType_ID) REFERENCES Exercise_Type(ExerciseType_ID)
);

CREATE TABLE Routine_Exercise (
    Routine_Exercise_ID INTEGER PRIMARY KEY,
    Routine_ID INTEGER,
    Exercise_ID INTEGER,
    Rest_Time INTEGER,
    Routine_Order INTEGER,
    Routine_Sets INTEGER,
    Routine_Reps INTEGER,
    FOREIGN KEY (Routine_ID) REFERENCES Routines(ROUTINE_ID),
    FOREIGN KEY (Exercise_ID) REFERENCES Exercise(Exercise_ID)
);

CREATE TABLE Workout_Log (
    Session_ID INTEGER PRIMARY KEY,
    User_ID INTEGER,
    Routine_ID INTEGER,
    Date DATE,
    FOREIGN KEY (User_ID) REFERENCES Users(USER_ID),
    FOREIGN KEY (Routine_ID) REFERENCES Routines(ROUTINE_ID)
);

CREATE TABLE Workout_Set (
    Set_ID INTEGER PRIMARY KEY,
    Session_ID INTEGER,
    Exercise_ID INTEGER,
    Unit_Type INTEGER,
    RPE INTEGER,
    Reps INTEGER,
    Weight INTEGER,
    FOREIGN KEY (Session_ID) REFERENCES Workout_Log(Session_ID),
    FOREIGN KEY (Exercise_ID) REFERENCES Exercise(Exercise_ID)
);