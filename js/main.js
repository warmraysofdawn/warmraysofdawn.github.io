document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('particles-container');
    
    // Проверяем, найден ли контейнер
    if (!container) {
        console.error('Контейнер particles-container не найден!');
        return;
    }
    
    console.log('Контейнер найден, создаем частицы...');
    
    const particleCount = 60;
    
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
    const nav = document.getElementById('main-nav');
    const body = document.body;

    if (burgerBtn && nav) {
        burgerBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });

        // Закрытие меню при клике на ссылку
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(event) {
            const isClickInsideNav = nav.contains(event.target);
            const isClickOnBurger = burgerBtn.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnBurger && nav.classList.contains('active')) {
                closeMenu();
            }
        });

        // Закрытие меню при нажатии Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && nav.classList.contains('active')) {
                closeMenu();
            }
        });

        function closeMenu() {
            burgerBtn.classList.remove('active');
            nav.classList.remove('active');
            body.classList.remove('menu-open');
            burgerBtn.setAttribute('aria-expanded', 'false');
        }
    }
});