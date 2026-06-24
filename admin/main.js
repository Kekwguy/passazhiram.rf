// Данные
const ADMIN_CREDENTIALS = {
    login: 'Admin26',
    password: 'Demo20'
};

// Инициализация заявок в localStorage
function initApplications() {
    if (!localStorage.getItem('adminApplications')) {
        const defaultApps = [
            {
                id: 1,
                user: 'Иванов Иван Иванович',
                userLogin: 'ivanov',
                transport: 'Автобус',
                date: '15.06.2026',
                payment: 'Предоплата по QR-коду',
                status: 'Новая'
            },
            {
                id: 2,
                user: 'Петрова Анна Сергеевна',
                userLogin: 'petrova',
                transport: 'Электробус',
                date: '20.06.2026',
                payment: 'Оплата картой МИР',
                status: 'Идет обучение'
            },
            {
                id: 3,
                user: 'Сидоров Алексей Петрович',
                userLogin: 'sidorov',
                transport: 'Трамвай',
                date: '10.06.2026',
                payment: 'Постоплата в офисе',
                status: 'Обучение завершено'
            },
            {
                id: 4,
                user: 'Козлова Елена Дмитриевна',
                userLogin: 'kozlova',
                transport: 'Автобус',
                date: '25.06.2026',
                payment: 'Предоплата по QR-коду',
                status: 'Новая'
            },
            {
                id: 5,
                user: 'Михайлов Денис Андреевич',
                userLogin: 'mihaylov',
                transport: 'Электробус',
                date: '05.07.2026',
                payment: 'Оплата картой МИР',
                status: 'Новая'
            }
        ];
        localStorage.setItem('adminApplications', JSON.stringify(defaultApps));
    }
}

function getApplications() {
    return JSON.parse(localStorage.getItem('adminApplications')) || [];
}

function saveApplications(apps) {
    localStorage.setItem('adminApplications', JSON.stringify(apps));
}

// Логин админа
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');

document.getElementById('adminLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const login = document.getElementById('adminLogin').value.trim();
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');
    const loginError = document.getElementById('adminLoginErrorText');
    const passwordError = document.getElementById('adminPasswordErrorText');

    // Очистка ошибок
    errorDiv.classList.remove('show');
    loginError.textContent = '';
    passwordError.textContent = '';
    document.getElementById('adminLogin').classList.remove('error');
    document.getElementById('adminPassword').classList.remove('error');

    let hasError = false;

    if (!login || login.length < 3) {
        loginError.textContent = 'Введите логин администратора';
        document.getElementById('adminLogin').classList.add('error');
        hasError = true;
    }

    if (!password || password.length < 4) {
        passwordError.textContent = 'Введите пароль';
        document.getElementById('adminPassword').classList.add('error');
        hasError = true;
    }

    if (hasError) return;

    if (login === ADMIN_CREDENTIALS.login && password === ADMIN_CREDENTIALS.password) {
        // Успешный вход
        loginContainer.classList.remove('active');
        adminContainer.classList.add('active');
        document.getElementById('adminName').textContent = login;
        initApplications();
        renderApplications();
        showToast('Добро пожаловать в панель администратора!', 'success');
    } else {
        errorDiv.classList.add('show');
        document.getElementById('adminLogin').classList.add('error');
        document.getElementById('adminPassword').classList.add('error');
    }
});

// Выход из админ-панели
document.getElementById('adminLogoutBtn').addEventListener('click', function () {
    adminContainer.classList.remove('active');
    loginContainer.classList.add('active');
    document.getElementById('adminLoginForm').reset();
    document.getElementById('adminLoginError').classList.remove('show');
    document.getElementById('adminLogin').classList.remove('error');
    document.getElementById('adminPassword').classList.remove('error');
    document.getElementById('adminLoginErrorText').textContent = '';
    document.getElementById('adminPasswordErrorText').textContent = '';
    showToast('Вы вышли из панели администратора', 'info');
});

// Рендеринг заявок
let currentPage = 1;
const itemsPerPage = 3;
let filteredApps = [];

function renderApplications() {
    const apps = getApplications();
    const statusFilter = document.getElementById('statusFilter').value;
    const transportFilter = document.getElementById('transportFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

    // Фильтрация
    filteredApps = apps.filter(app => {
        const matchStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchTransport = transportFilter === 'all' || app.transport === transportFilter;
        const matchSearch = app.user.toLowerCase().includes(searchFilter);
        return matchStatus && matchTransport && matchSearch;
    });

    // Обновление статистики
    const total = apps.length;
    const newCount = apps.filter(a => a.status === 'Новая').length;
    const trainingCount = apps.filter(a => a.status === 'Идет обучение').length;
    const completedCount = apps.filter(a => a.status === 'Обучение завершено').length;

    document.getElementById('totalApps').textContent = total;
    document.getElementById('newApps').textContent = newCount;
    document.getElementById('trainingApps').textContent = trainingCount;
    document.getElementById('completedApps').textContent = completedCount;

    // Пагинация
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredApps.slice(start, end);

    // Рендер таблицы
    const tbody = document.getElementById('applicationsTableBody');
    if (pageItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        Заявок не найдено
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageItems.map(app => `
            <tr>
                <td>${app.id}</td>
                <td><strong>${app.user}</strong></td>
                <td>${app.transport}</td>
                <td>${app.date}</td>
                <td>${app.payment}</td>
                <td>
                    <span class="status-badge ${getStatusClass(app.status)}">
                        ${app.status}
                    </span>
                </td>
                <td>
                    <select class="status-select" data-id="${app.id}">
                        <option value="Новая" ${app.status === 'Новая' ? 'selected' : ''}>Новая</option>
                        <option value="Идет обучение" ${app.status === 'Идет обучение' ? 'selected' : ''}>Идет обучение</option>
                        <option value="Обучение завершено" ${app.status === 'Обучение завершено' ? 'selected' : ''}>Обучение завершено</option>
                    </select>
                </td>
            </tr>
        `).join('');
    }

    // Обновление пагинации
    document.getElementById('pageInfo').textContent = `Страница ${currentPage} из ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;

    // Обработчики изменения статуса
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function () {
            const id = parseInt(this.dataset.id);
            const newStatus = this.value;
            updateApplicationStatus(id, newStatus);
        });
    });

    // Обновляем сортировку
    updateSortIndicators();
}

function getStatusClass(status) {
    const map = {
        'Новая': 'status-new',
        'Идет обучение': 'status-training',
        'Обучение завершено': 'status-completed'
    };
    return map[status] || 'status-new';
}

// Обновление статуса
function updateApplicationStatus(id, newStatus) {
    const apps = getApplications();
    const app = apps.find(a => a.id === id);
    if (app) {
        const oldStatus = app.status;
        app.status = newStatus;
        saveApplications(apps);
        renderApplications();
        showToast(`Статус заявки #${id} изменен с "${oldStatus}" на "${newStatus}"`, 'success');
    }
}

// Фильтры
document.getElementById('statusFilter').addEventListener('change', () => {
    currentPage = 1;
    renderApplications();
});

document.getElementById('transportFilter').addEventListener('change', () => {
    currentPage = 1;
    renderApplications();
});

document.getElementById('searchFilter').addEventListener('input', () => {
    currentPage = 1;
    renderApplications();
});

// Пагинация
document.getElementById('prevPage').addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        renderApplications();
    }
});

document.getElementById('nextPage').addEventListener('click', function () {
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
    if (currentPage < totalPages) {
        currentPage++;
        renderApplications();
    }
});

// Сортировка
let sortField = null;
let sortDirection = 'asc';

document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', function () {
        const field = this.dataset.sort;
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }
        sortApplications(field, sortDirection);
        renderApplications();
    });
});

function sortApplications(field, direction) {
    const apps = getApplications();
    const sorted = apps.sort((a, b) => {
        let valA = a[field] || '';
        let valB = b[field] || '';
        if (field === 'id') {
            valA = parseInt(valA);
            valB = parseInt(valB);
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    saveApplications(sorted);
}

function updateSortIndicators() {
    document.querySelectorAll('th[data-sort] i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    if (sortField) {
        const th = document.querySelector(`th[data-sort="${sortField}"] i`);
        if (th) {
            th.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
        }
    }
}

// Уведомление
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const text = document.getElementById('toastText');

    const icons = {
        success: 'fa-check-circle toast-icon-success',
        info: 'fa-info-circle toast-icon-info',
        warning: 'fa-exclamation-triangle toast-icon-warning'
    };

    icon.className = `fas ${icons[type] || icons.success}`;
    text.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.getElementById('toastClose').addEventListener('click', function () {
    document.getElementById('toast').classList.remove('show');
});

// Инициализация
initApplications();
console.log('Админ-панель готова. Логин: Admin26, Пароль: Demo20');