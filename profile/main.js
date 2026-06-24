// Проверка авторизации
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = '../login/login.html';
}

// Отображение данных пользователя
document.getElementById('userFullName').textContent = currentUser.fullName || currentUser.login;
document.getElementById('userEmail').textContent = currentUser.email || 'email@example.com';
document.getElementById('userPhone').textContent = currentUser.phone || '+7 (XXX) XXX-XX-XX';

// Выход из системы
document.getElementById('logoutBtn').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.href = '../login/login.html';
});

// Отображение заявок
function renderApplications() {
    const grid = document.getElementById('applicationsGrid');
    const userLogin = currentUser.login;

    // Получаем все заявки из localStorage
    const allApps = JSON.parse(localStorage.getItem('adminApplications')) || [];

    // Фильтруем заявки текущего пользователя
    const userApps = allApps.filter(app => app.userLogin === userLogin);

    if (userApps.length === 0) {
        grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p style="font-size: 16px;">У вас пока нет заявок</p>
                        <p style="font-size: 14px; color: #aab0b6; margin-top: 4px;">
                            <a href="../application/application.html">Создать первую заявку</a>
                        </p>
                    </div>
                `;
        return;
    }

    grid.innerHTML = userApps.map((app, index) => `
                <div class="application-card">
                    <div class="application-info">
                        <span class="app-id">Заявка #${index + 1}</span>
                        <div class="app-details">
                            <strong>${app.transport}</strong> — ${app.payment}
                        </div>
                        <span class="app-date">Дата начала: ${app.date}</span>
                    </div>
                    <div class="application-status">
                        <span class="status-badge ${getStatusClass(app.status)}">
                            ${app.status}
                        </span>
                        <button class="btn-review ${app.status === 'Обучение завершено' ? 'active' : ''}" 
                                data-app-id="${index}" 
                                ${app.status !== 'Обучение завершено' ? 'disabled' : ''}>
                            <i class="fas fa-star"></i> Оставить отзыв
                        </button>
                    </div>
                </div>
            `).join('');

    // Обработчики для кнопок отзыва
    document.querySelectorAll('.btn-review').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', function () {
                const appId = this.dataset.appId;
                showReviewModal(appId);
            });
        }
    });
}

function getStatusClass(status) {
    const map = {
        'Новая': 'status-new',
        'Идет обучение': 'status-training',
        'Обучение завершено': 'status-completed'
    };
    return map[status] || 'status-new';
}

// Модальное окно для отзыва
function showReviewModal(appId) {
    const allApps = JSON.parse(localStorage.getItem('adminApplications')) || [];
    const userLogin = currentUser.login;
    const userApps = allApps.filter(app => app.userLogin === userLogin);
    const app = userApps[appId];

    // Создаем модальное окно
    const overlay = document.createElement('div');
    overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            `;

    const modal = document.createElement('div');
    modal.style.cssText = `
                background: #ffffff;
                border-radius: 16px;
                padding: 32px;
                max-width: 480px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                animation: slideUp 0.3s ease;
            `;

    modal.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-star" style="font-size: 48px; color: #ff9800; display: block; margin-bottom: 12px;"></i>
                    <h2 style="font-size: 22px; color: #0d47a1; font-weight: 400;">Оставить отзыв</h2>
                    <p style="color: #6c757d; font-size: 14px; margin-top: 4px;">
                        Заявка #${appId + 1}: ${app.transport}
                    </p>
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="font-size: 14px; color: #0d47a1; display: block; margin-bottom: 6px;">
                        Ваша оценка
                    </label>
                    <div style="display: flex; gap: 8px; font-size: 28px;" id="ratingStars">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <span style="cursor: pointer; color: #e0e5e9; transition: color 0.2s;" data-rating="${i}">★</span>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="font-size: 14px; color: #0d47a1; display: block; margin-bottom: 6px;">
                        Текст отзыва
                    </label>
                    <textarea id="reviewText" placeholder="Напишите ваш отзыв..." 
                              style="width: 100%; padding: 10px 14px; border: 1.5px solid #e0e5e9; border-radius: 8px; 
                                     font-family: 'PT Sans', sans-serif; font-size: 14px; min-height: 100px; resize: vertical;"></textarea>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancelReview" style="background: #f8f9fa; color: #6c757d; border: 1.5px solid #e0e5e9; 
                            padding: 8px 20px; border-radius: 8px; font-family: 'PT Sans', sans-serif; font-size: 14px; 
                            cursor: pointer; transition: all 0.3s ease;">
                        Отмена
                    </button>
                    <button id="submitReview" style="background: #007bff; color: white; border: none; 
                            padding: 8px 20px; border-radius: 8px; font-family: 'PT Sans', sans-serif; font-size: 14px; 
                            cursor: pointer; transition: all 0.3s ease;">
                        <i class="fas fa-paper-plane"></i> Отправить
                    </button>
                </div>
            `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Добавляем стили анимаций
    const style = document.createElement('style');
    style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
    document.head.appendChild(style);

    // Закрытие по клику вне модального окна
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // Обработка выбора рейтинга
    let selectedRating = 0;
    const stars = modal.querySelectorAll('#ratingStars span');
    stars.forEach(star => {
        star.addEventListener('click', function () {
            selectedRating = parseInt(this.dataset.rating);
            stars.forEach((s, i) => {
                s.style.color = i < selectedRating ? '#ff9800' : '#e0e5e9';
            });
        });
        star.addEventListener('mouseenter', function () {
            const rating = parseInt(this.dataset.rating);
            stars.forEach((s, i) => {
                s.style.color = i < rating ? '#ffd54f' : '#e0e5e9';
            });
        });
        star.addEventListener('mouseleave', function () {
            stars.forEach((s, i) => {
                s.style.color = i < selectedRating ? '#ff9800' : '#e0e5e9';
            });
        });
    });

    // Отмена
    document.getElementById('cancelReview').addEventListener('click', function () {
        overlay.remove();
    });

    // Отправка отзыва
    document.getElementById('submitReview').addEventListener('click', function () {
        const reviewText = document.getElementById('reviewText').value.trim();
        if (selectedRating === 0) {
            alert('Пожалуйста, поставьте оценку');
            return;
        }
        if (!reviewText) {
            alert('Пожалуйста, напишите текст отзыва');
            return;
        }

        // Сохраняем отзыв
        const reviews = JSON.parse(localStorage.getItem('userReviews')) || [];
        reviews.push({
            userLogin: userLogin,
            userName: currentUser.fullName || currentUser.login,
            appId: appId + 1,
            transport: app.transport,
            rating: selectedRating,
            text: reviewText,
            date: new Date().toISOString()
        });
        localStorage.setItem('userReviews', JSON.stringify(reviews));

        // Показываем уведомление
        alert('Спасибо за ваш отзыв!');
        overlay.remove();

        // Обновляем состояние кнопки
        const btn = document.querySelector(`.btn-review[data-app-id="${appId}"]`);
        if (btn) {
            btn.textContent = '✓ Отзыв отправлен';
            btn.disabled = true;
            btn.style.opacity = '0.6';
        }
    });
}

// Инициализация
renderApplications();