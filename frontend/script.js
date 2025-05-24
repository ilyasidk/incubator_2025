// Базовый плейсхолдер скрипта
console.log("Flashcards Master frontend script loaded.");

// Конфигурация
const API_URL = 'http://localhost:8080/api';

// Элементы DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const errorMessage = document.getElementById('error-message');
const registerErrorMessage = document.getElementById('register-error-message');

// Обработчики событий
window.addEventListener('DOMContentLoaded', () => {
    // Проверить, авторизован ли пользователь
    const token = localStorage.getItem('token');
    if (token) {
        redirectToDashboard();
    }
    
    // Показать форму регистрации
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });
    
    // Показать форму входа
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    
    // Отправка формы входа
    loginButton.addEventListener('click', handleLogin);
    
    // Отправка формы регистрации
    registerButton.addEventListener('click', handleRegister);
});

// Обработка отправки формы входа
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
        
        // Сохранить токен в локальное хранилище
        localStorage.setItem('token', data.token);
        
        // Перенаправить на панель управления
        redirectToDashboard();
        
    } catch (error) {
        showError(errorMessage, error.message || 'Login failed. Please try again.');
        loginButton.textContent = 'Login';
        loginButton.disabled = false;
    }
}

// Обработка отправки формы регистрации
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
        
        // Сохранить токен в локальное хранилище
        localStorage.setItem('token', data.token);
        
        // Перенаправить на панель управления
        redirectToDashboard();
        
    } catch (error) {
        showError(registerErrorMessage, error.message || 'Registration failed. Please try again.');
        registerButton.textContent = 'Register';
        registerButton.disabled = false;
    }
}

// Вспомогательная функция для отображения сообщений об ошибках
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
    
    // Скрыть ошибку через 5 секунд
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

// Вспомогательная функция для перенаправления на панель управления
function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

// TODO: Добавить фронтенд-логику для аутентификации, получения карточек, отображения карточек, обработки взаимодействий и т.д. 