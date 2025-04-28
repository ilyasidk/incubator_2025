// Basic script placeholder
console.log("Flashcards Master frontend script loaded.");

// Configuration
const API_URL = 'http://localhost:8000/api';

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const errorMessage = document.getElementById('error-message');
const registerErrorMessage = document.getElementById('register-error-message');

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        redirectToDashboard();
    }
    
    // Show register form
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });
    
    // Show login form
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    
    // Login form submission
    loginButton.addEventListener('click', handleLogin);
    
    // Register form submission
    registerButton.addEventListener('click', handleRegister);
});

// Handle login form submission
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError(errorMessage, 'Email and password are required.');
        return;
    }
    
    try {
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Save token to local storage
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        redirectToDashboard();
        
    } catch (error) {
        showError(errorMessage, error.message || 'Login failed. Please try again.');
        loginButton.textContent = 'Login';
        loginButton.disabled = false;
    }
}

// Handle register form submission
async function handleRegister() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!email || !password || !confirmPassword) {
        showError(registerErrorMessage, 'All fields are required.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(registerErrorMessage, 'Passwords do not match.');
        return;
    }
    
    try {
        registerButton.textContent = 'Registering...';
        registerButton.disabled = true;
        
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Save token to local storage
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        redirectToDashboard();
        
    } catch (error) {
        showError(registerErrorMessage, error.message || 'Registration failed. Please try again.');
        registerButton.textContent = 'Register';
        registerButton.disabled = false;
    }
}

// Helper function to show error messages
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

// Helper function to redirect to dashboard
function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

// TODO: Add frontend logic for auth, fetching cards, displaying cards, handling interactions, etc. 