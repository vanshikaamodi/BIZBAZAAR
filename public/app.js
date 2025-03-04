async function fetchUserData() {
    const token = localStorage.getItem("token");
    if (!token) {
        return; // No token, keep the logo as is
    }

    try {
        const response = await fetch("/dashboard", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Invalid response from server");
        }

        const data = await response.json();

        if (data.user) {
            // Extract initials from the user's name
            const initials = data.user.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase();

            // Replace the logo with the dynamic profile icon
            const profileSection = document.getElementById("profileSection");
            if (profileSection) {
                profileSection.innerHTML = `<div class="profile-icon">${initials}</div>`;
            }
        } else {
            // If the token is invalid, redirect to login
            alert("Session expired. Please log in again.");
            window.location.href = "/login.html";
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("An error occurred. Please try again later.");
    }
}

fetchUserData();
