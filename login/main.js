// Переключение вкладок
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = {
    login: document.getElementById('loginPanel'),
    register: document.getElementById('registerPanel')
};

tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        const tab = this.dataset.tab;

        // Обновляем активную кнопку
        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Показываем нужную панель
        Object.keys(panels).forEach(key => {
            panels[key].classList.toggle('active', key === tab);
        });

        // Очищаем ошибки при переключении
        clearAllErrors();
    });
});

// Логин
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const login = document.getElementById('loginLogin').value.trim();
    const password = document.getElementById('loginPassword').value;
    const generalError = document.getElementById('loginGeneralError');
    const loginError = document.getElementById('loginLoginError');
    const passwordError = document.getElementById('loginPasswordError');

    // Очистка ошибок
    loginError.textContent = '';
    loginError.classList.remove('show');
    passwordError.textContent = '';
    passwordError.classList.remove('show');
    generalError.classList.remove('show');
    document.getElementById('loginLogin').classList.remove('error');
    document.getElementById('loginPassword').classList.remove('error');

    let hasError = false;

    if (!login || login.length < 6) {
        loginError.textContent = 'Логин должен содержать минимум 6 символов';
        loginError.classList.add('show');
        document.getElementById('loginLogin').classList.add('error');
        hasError = true;
    }

    if (!password || password.length < 8) {
        passwordError.textContent = 'Пароль должен содержать минимум 8 символов';
        passwordError.classList.add('show');
        document.getElementById('loginPassword').classList.add('error');
        hasError = true;
    }

    if (hasError) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.login === login && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = '../main/main.html';
    } else {
        generalError.classList.add('show');
        document.getElementById('loginLogin').classList.add('error');
        document.getElementById('loginPassword').classList.add('error');
    }
});

// Регистрация
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    clearAllErrors();

    const login = document.getElementById('regLogin').value.trim();
    const password = document.getElementById('regPassword').value;
    const fullName = document.getElementById('regFullName').value.trim();
    const birthDate = document.getElementById('regBirthDate').value;
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();

    let isValid = true;

    // Валидация логина
    const loginRegex = /^[a-zA-Z0-9]+$/;
    if (login.length < 6) {
        showRegError('regLoginError', 'Логин должен содержать минимум 6 символов');
        document.getElementById('regLogin').classList.add('error');
        isValid = false;
    } else if (!loginRegex.test(login)) {
        showRegError('regLoginError', 'Логин должен содержать только латинские буквы и цифры');
        document.getElementById('regLogin').classList.add('error');
        isValid = false;
    } else {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.login === login);
        if (userExists) {
            showRegError('regLoginError', 'Пользователь с таким логином уже существует');
            document.getElementById('regLogin').classList.add('error');
            isValid = false;
        }
    }

    // Валидация пароля
    if (password.length < 8) {
        showRegError('regPasswordError', 'Пароль должен содержать минимум 8 символов');
        document.getElementById('regPassword').classList.add('error');
        isValid = false;
    }

    // Валидация ФИО
    if (fullName.length < 2) {
        showRegError('regFullNameError', 'Введите ваше полное имя');
        document.getElementById('regFullName').classList.add('error');
        isValid = false;
    }

    // Валидация даты рождения
    if (!birthDate) {
        showRegError('regBirthDateError', 'Укажите дату рождения');
        document.getElementById('regBirthDate').classList.add('error');
        isValid = false;
    } else {
        const birthDateObj = new Date(birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (age < 18 || (age === 18 && monthDiff < 0)) {
            showRegError('regBirthDateError', 'Вам должно быть не менее 18 лет');
            document.getElementById('regBirthDate').classList.add('error');
            isValid = false;
        }
    }

    // Валидация телефона
    const phoneRegex = /^[\+\d\s\-\(\)]{10,20}$/;
    if (!phone || !phoneRegex.test(phone)) {
        showRegError('regPhoneError', 'Введите корректный номер телефона');
        document.getElementById('regPhone').classList.add('error');
        isValid = false;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showRegError('regEmailError', 'Введите корректный email адрес');
        document.getElementById('regEmail').classList.add('error');
        isValid = false;
    }

    if (!isValid) return;

    // Сохранение пользователя
    const newUser = {
        login: login,
        password: password,
        fullName: fullName,
        birthDate: birthDate,
        phone: phone,
        email: email,
        registeredAt: new Date().toISOString(),
        applications: [],
        reviews: []
    };

    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    localStorage.setItem('currentUser', JSON.stringify(newUser));

    showRegSuccess('Регистрация успешно завершена! Перенаправление...');

    setTimeout(() => {
        window.location.href = '../main/main.html';
    }, 1500);
});

// Вспомогательные функции для регистрации
function showRegError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });

    const generalErrors = document.querySelectorAll('.general-error');
    generalErrors.forEach(el => {
        el.classList.remove('show');
    });
}

function showRegSuccess(message) {
    const form = document.getElementById('registerForm');
    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) existingSuccess.remove();

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            `;
    form.insertBefore(successDiv, form.firstChild);
}

// Автоматический переход на вкладку входа, если пользователь уже авторизован
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (currentUser) {
    window.location.href = '../main/main.html';
}