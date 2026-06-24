// Проверка авторизации
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = '../login/login.html';
}

// Валидация даты (мм.дд.гггг)
function validateDate(dateStr) {
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!regex.test(dateStr)) return false;

    const [, day, month, year] = dateStr.match(regex);
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    // Проверка на корректность даты
    const dateObj = new Date(y, m - 1, d);
    return dateObj.getFullYear() === y &&
        dateObj.getMonth() === m - 1 &&
        dateObj.getDate() === d &&
        y >= 2024 && y <= 2030;
}

// Форматирование даты при вводе
document.getElementById('startDate').addEventListener('input', function (e) {
    let value = this.value.replace(/\D/g, '');

    if (value.length > 2 && value.length <= 4) {
        value = value.slice(0, 2) + '.' + value.slice(2);
    } else if (value.length > 4 && value.length <= 6) {
        value = value.slice(0, 2) + '.' + value.slice(2, 4) + '.' + value.slice(4);
    } else if (value.length > 6) {
        value = value.slice(0, 2) + '.' + value.slice(2, 4) + '.' + value.slice(4, 8);
    }

    this.value = value;
});

// Отправка заявки
document.getElementById('applicationForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Очистка ошибок
    clearErrors();

    const transport = document.getElementById('transportType').value;
    const date = document.getElementById('startDate').value.trim();
    const payment = document.getElementById('paymentMethod').value;

    let isValid = true;

    // Валидация транспорта
    if (!transport) {
        showError('transportError');
        document.getElementById('transportType').classList.add('error');
        isValid = false;
    }

    // Валидация даты
    if (!validateDate(date)) {
        showError('dateError');
        document.getElementById('startDate').classList.add('error');
        isValid = false;
    }

    // Валидация оплаты
    if (!payment) {
        showError('paymentError');
        document.getElementById('paymentMethod').classList.add('error');
        isValid = false;
    }

    if (!isValid) return;

    // Создание заявки
    const allApps = JSON.parse(localStorage.getItem('adminApplications')) || [];

    // Генерация ID
    const newId = allApps.length > 0 ? Math.max(...allApps.map(a => a.id)) + 1 : 1;

    const newApplication = {
        id: newId,
        user: currentUser.fullName || currentUser.login,
        userLogin: currentUser.login,
        transport: transport,
        date: date,
        payment: payment,
        status: 'Новая',
        createdAt: new Date().toISOString()
    };

    allApps.push(newApplication);
    localStorage.setItem('adminApplications', JSON.stringify(allApps));

    // Показываем успех
    showSuccess('Заявка #' + newId + ' успешно создана! Ожидайте одобрения администратора.');

    // Очищаем форму
    document.getElementById('transportType').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('paymentMethod').value = '';

    // Перенаправление через 3 секунды
    setTimeout(() => {
        window.location.href = '../profile/profile.html';
    }, 3000);
});

// Вспомогательные функции
function showError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.classList.add('show');
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
    });
    document.querySelectorAll('select, input').forEach(el => {
        el.classList.remove('error');
    });
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const textSpan = document.getElementById('successText');
    textSpan.textContent = message;
    successDiv.classList.add('show');

    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 5000);
}