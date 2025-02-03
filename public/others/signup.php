<?php
// Database credentials
$host = "localhost"; // Usually "localhost"
$username = "lappy-topo/SQLEXPRESS"; // Your MySQL username
$password = ""; // Your MySQL password
$database = "Bidbazaar"; // Your database name

// Connect to the database
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve form data
$FullName = $_POST['FullName'];
$EmailAddress = $_POST['EmailAddress'];
$Password = $_POST['Password'];
$confirmpassword = $_POST['confirmpassword'];

// Validate passwords match
if ($Password !== $confirmpassword) {
    die("Passwords do not match.");
}

// Insert data into the database
$sql = "INSERT INTO signup_Table (FullName, EmailAddress, Password, confirmpassword) 
        VALUES ('$FullName', '$EmailAddress', '$Password', '$confirmpassword')";

if ($conn->query($sql) === TRUE) {
    echo "Form submitted successfully!";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}
// Close connection
$conn->close();
?>
