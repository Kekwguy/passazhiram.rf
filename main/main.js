// Проверка авторизации
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
    window.location.href = '../login/login.html';
} else {
    document.getElementById('userName').textContent = currentUser.fullName || currentUser.login;
}

// Выход
document.getElementById('logoutBtn').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    window.location.href = '../login/login.html';
});

// Слайдер-галерея
(function () {
    let currentSlide = 0;
    const track = document.getElementById('galleryTrack');
    const slides = track.querySelectorAll('.gallery-slide');
    const totalSlides = slides.length;
    const dotsContainer = document.getElementById('galleryDots');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const container = document.getElementById('galleryContainer');

    // Если слайдов нет, выходим
    if (totalSlides === 0) return;

    // Создание точек
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('gallery-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.gallery-dot');

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;
        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // Обработчики кнопок
    prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        goToSlide(currentSlide - 1);
    });

    nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        goToSlide(currentSlide + 1);
    });

    // Автоматическое переключение
    let autoPlayInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 4000);

    // Остановка при наведении
    container.addEventListener('mouseenter', function () {
        clearInterval(autoPlayInterval);
    });

    container.addEventListener('mouseleave', function () {
        autoPlayInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 4000);
    });

    // Клавиатурная навигация
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
            goToSlide(currentSlide - 1);
        } else if (e.key === 'ArrowRight') {
            goToSlide(currentSlide + 1);
        }
    });

    // Инициализация
    goToSlide(0);

    // Обработка resize для корректного отображения
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            track.style.transition = 'none';
            track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
            setTimeout(function () {
                track.style.transition = 'transform 0.6s ease-in-out';
            }, 50);
        }, 100);
    });

    console.log('Слайдер инициализирован. Слайдов: ' + totalSlides);
})();