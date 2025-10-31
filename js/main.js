document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('particles-container');
    
    // Проверяем, найден ли контейнер
    if (!container) {
        console.error('Контейнер particles-container не найден!');
        return;
    }
    
    console.log('Контейнер найден, создаем частицы...');
    
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Случайная позиция
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Случайный размер
        const size = 50 + Math.random() * 40;
        
        // Случайная задержка
        const delay = Math.random() * 5;
        const duration = 10 + Math.random() * 15;
        
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
    }
    
    console.log(`Создано ${particleCount} частиц`);
});

// Бургер-меню
document.addEventListener('DOMContentLoaded', function() {
    const burgerBtn = document.getElementById('burger-btn');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;

    burgerBtn.addEventListener('click', function() {
        // Переключаем активные классы
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
        body.classList.toggle('menu-open');

        // Блокируем скролл при открытом меню
        if (mainNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Закрываем меню при клике на ссылку
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            burgerBtn.classList.remove('active');
            mainNav.classList.remove('active');
            body.classList.remove('menu-open');
            document.body.style.overflow = '';
        });
    });

    // Закрываем меню при клике вне его
    document.addEventListener('click', function(event) {
        const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnBurger = burgerBtn.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnBurger && mainNav.classList.contains('active')) {
            burgerBtn.classList.remove('active');
            mainNav.classList.remove('active');
            body.classList.remove('menu-open');
            document.body.style.overflow = '';
        }
    });

    // Закрываем меню при нажатии Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mainNav.classList.contains('active')) {
            burgerBtn.classList.remove('active');
            mainNav.classList.remove('active');
            body.classList.remove('menu-open');
            document.body.style.overflow = '';
        }
    });
});