const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'XYZuniversity' // Changed to match the new database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected');
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));

// Registration page
app.get('/register', (req, res) => {
    res.render('register');
});

// Handle registration form submission
app.post('/register', (req, res) => {
    const { username, password, fullname } = req.body;
    const insertQuery = 'INSERT INTO UserAccounts (UserName, PasswordHash, FullName) VALUES (?, ?, ?)';
    db.query(insertQuery, [username, password, fullname], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Error registering user');
            return;
        }
        console.log('User registered successfully');
        res.redirect('login');
    });
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const selectQuery = 'SELECT * FROM UserAccounts WHERE UserName = ? AND PasswordHash = ?'; // Updated column names
    db.query(selectQuery, [username, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const userId = result[0].UserID;
            res.redirect(`/students/${userId}`);
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    });
});

// Student list page for individual user
app.get('/students/:userId', (req, res) => {
    const userId = req.params.userId;
    const selectQuery = 'SELECT * FROM Scholars WHERE UserID = ?'; // Updated table name
    db.query(selectQuery, [userId], (err, results) => {
        if (err) throw err;
        res.render('students', { students: results, userId: userId });
    });
});

// Add student form
app.get('/students/add/:userId', (req, res) => {
    const userId = req.params.userId;
    res.render('add_student', { userId: userId });
});

// Handle form submission to add a new student
app.post('/students', (req, res) => {
    const { FullName, EmailAddress, PhoneNumber, Address, DateOfBirth, Gender, userID } = req.body; // Updated column names
    const insertQuery = 'INSERT INTO Scholars (FullName, EmailAddress, PhoneNumber, Address, DateOfBirth, Gender, UserID) VALUES (?, ?, ?, ?, ?, ?, ?)'; // Updated table name and column names
    db.query(insertQuery, [FullName, EmailAddress, PhoneNumber, Address, DateOfBirth, Gender, userID], (err, result) => {
        if (err) {
            console.error('Error inserting student:', err);
            res.status(500).send('Error inserting student');
            return;
        }
        console.log('Student added successfully');
        res.redirect(`/students/${userID}`);
    });
});

// Edit student form
app.get('/students/:userId/:id/edit', (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    const selectQuery = 'SELECT * FROM Scholars WHERE ScholarID = ?'; // Updated table name
    db.query(selectQuery, [id], (err, result) => {
        if (err) throw err;
        res.render('edit_student', { student: result[0], userId: userId });
    });
});

// Handle form submission to update a student's details
app.post('/students/:userId/:id/edit', (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    const { FullName, EmailAddress, PhoneNumber, Address, DateOfBirth, Gender } = req.body;
    const updateQuery = 'UPDATE Scholars SET FullName=?, EmailAddress=?, PhoneNumber=?, Address=?, DateOfBirth=?, Gender=? WHERE ScholarID=?';
    db.query(updateQuery, [FullName, EmailAddress, PhoneNumber, Address, DateOfBirth, Gender, id], (err, result) => {
        if (err) {
            console.error('Error updating student data:', err);
            res.status(500).send('Error updating student data');
            return;
        }
        console.log('Student data updated successfully');
        res.redirect(`/students/${userId}`);
    });
});


// Handle student deletion
app.post('/students/:userId/:id/delete', (req, res) => {
    const userId = req.params.userId;
    const id = req.params.id;
    const deleteQuery = 'DELETE FROM Scholars WHERE ScholarID = ?'; // Updated table name
    db.query(deleteQuery, [id], (err, result) => {
        if (err) throw err;
        console.log('Student deleted successfully');
        res.redirect(`/students/${userId}`);
    });
});

// Placeholder routes
// Replace these with your actual routes and their handlers

// Example placeholder route
app.get('/example', (req, res) => {
    res.send('This is an example route');
});

// Listen on port
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
