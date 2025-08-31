// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            return data.user;
        }
        return null;
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// Update UI based on auth status
async function updateAuthUI() {
    const user = await checkAuth();
    const loginForm = document.querySelector('.log');
    const navRight = document.querySelector('.nav-right');

    if (user) {
        // User is logged in
        if (loginForm) {
            loginForm.innerHTML = `
                <div class="user-info">
                    <h3>Welcome, ${user.fullName}!</h3>
                    <p>Username: ${user.username}</p>
                    <button class="btn" onclick="logout()">Logout</button>
                    <a href="submit.html" class="btn">Dashboard</a>
                </div>
            `;
        }
    }
}

// Login function
async function login(event) {
    event.preventDefault();
    
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="pass"]').value;
    const captcha = document.querySelector('input[name="captcha"]').value;

    // Simple captcha validation (in production, use proper captcha)
    if (captcha.toLowerCase() !== 'easy') {
        alert('Invalid captcha. Please enter "easy"');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            window.location.href = 'submit.html';
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Logged out successfully');
            window.location.href = 'Notes.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Register function
async function register(event) {
    event.preventDefault();

    const formData = {
        firstName: document.querySelector('input[placeholder="First Name"]').value,
        lastName: document.querySelector('input[placeholder="Last Name"]').value,
        username: document.querySelector('input[placeholder="First Name"]').value.toLowerCase() + 
                  document.querySelector('input[placeholder="Last Name"]').value.toLowerCase(),
        email: document.querySelector('input[type="email"]').value,
        password: prompt('Please enter a password (min 6 characters):'),
        dateOfBirth: document.querySelector('input[type="date"]').value,
        qualification: document.querySelector('input[placeholder="Enter Your Qualification"]').value,
        mobileNumber: document.querySelector('input[type="phone"]').value
    };

    // Validate captcha
    const captcha = document.querySelector('input[placeholder="Enter Captcha"]').value;
    if (captcha.toLowerCase() !== 'easy') {
        alert('Invalid captcha. Please enter "easy"');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! You can now login.');
            window.location.href = 'Notes.html';
        } else {
            if (data.errors) {
                alert(data.errors.map(e => e.msg).join('\n'));
            } else {
                alert(data.error || 'Registration failed');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Add login form listener
    const loginForm = document.querySelector('.log');
    if (loginForm && loginForm.querySelector('button.submit')) {
        loginForm.querySelector('button.submit').addEventListener('click', login);
    }

    // Add register form listener
    const registerBtn = document.querySelector('.sub button.ver[onclick*="Submit"]');
    if (registerBtn) {
        registerBtn.addEventListener('click', register);
    }
});