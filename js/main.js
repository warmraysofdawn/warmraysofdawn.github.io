/**
 * ТЁПЛЫЕ ЛУЧИ РАССВЕТА • AETHERIAL DAWN
 * Интеллектуальные взаимодействия для поэтического сайта
 * Автор: Сахарный монстр • 2026
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // 🎯 Плавное появление контента при загрузке
  const initFadeIn = () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.75s var(--ease-breath)';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  };
  initFadeIn();
  
  // ========================================
  // 🖱 КУРСОР: ЭФИРНЫЙ СПУТНИК С ИНЕРЦИЕЙ
  // ========================================
const initCursor = () => {
  // Не инициализируем, если не поддерживается hover или включена экономия
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  let cursor = document.getElementById('dawn-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'dawn-cursor';
    document.body.appendChild(cursor);
  }
  
  // Простое отслеживание без пересчёта для каждого элемента
  document.addEventListener('mousemove', (e) => {
    // Обновляем позицию курсора напрямую (без инерции для стабильности)
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Обновляем глобальные переменные для эффектов (ОДИН раз, не для каждого элемента)
    document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
    document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
  }, { passive: true });
  
  // Плавное увеличение/уменьшение при наведении (через CSS, не JS)
  const interactiveSelectors = 'a, button, .poem, .card, .card-button, [role="link"]';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.style.width = '58px';
      cursor.style.height = '58px';
      cursor.style.filter = 'blur(0.4px)';
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.style.width = '34px';
      cursor.style.height = '34px';
      cursor.style.filter = 'none';
    }
  });
};
  initCursor();
  
  // ========================================
  // ✨ ЧАСТИЦЫ: ЖИВАЯ ПЫЛЬ РАССВЕТА
  // ========================================
  const initParticles = () => {
    const container = document.getElementById('particles-container') || 
      (() => {
        const c = document.createElement('div');
        c.id = 'particles-container';
        document.body.appendChild(c);
        return c;
      })();
    
    // Не создаём частицы, если включена экономия анимаций
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const createParticle = () => {
      const p = document.createElement('div');
      p.className = 'dawn-particle';
      
      // Генерируем органичные параметры
      const size = 1.4 + Math.random() * 3.2;
      const hue = 32 + Math.random() * 52; // розово-золото-лавандовая гамма
      const duration = 22 + Math.random() * 38;
      const driftX = (Math.random() - 0.5) * 90;
      const driftY = (Math.random() - 0.5) * 90;
      const minOpacity = 0.22 + Math.random() * 0.35;
      const maxOpacity = 0.58 + Math.random() * 0.38;
      
      Object.assign(p.style, {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: `hsla(${hue}, 82%, 74%, ${0.38 + Math.random() * 0.54})`,
        '--duration': `${duration}s`,
        '--drift-x': `${driftX}px`,
        '--drift-y': `${driftY}px`,
        '--min-opacity': minOpacity.toFixed(2),
        '--max-opacity': maxOpacity.toFixed(2),
      });
      
      container.appendChild(p);
      
      // Автоудаление после завершения анимационного цикла
      setTimeout(() => {
        if (p.parentNode) p.remove();
      }, (duration + 8) * 1000);
    };
    
    // Создаём начальный «рой» частиц
    const isMobile = window.innerWidth < 768;
    const initialCount = isMobile ? 14 : 32;
    
    for (let i = 0; i < initialCount; i++) {
      setTimeout(createParticle, i * (isMobile ? 350 : 180));
    }
    
    // Поддерживаем постоянное присутствие частиц
    const interval = isMobile ? 4200 : 2100;
    setInterval(createParticle, interval);
  };
  initParticles();
  
  // ========================================
  // 📜 СКРОЛЛ-РЕАКТИВНОСТЬ: ФОН «ЧУВСТВУЕТ»
  // ========================================
  const initScrollReactivity = () => {
    const updateScrollVars = () => {
      const scrolled = window.scrollY;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(scrolled / maxScroll, 1);
      
      // Передаём прогресс в CSS для анимаций фона
      document.documentElement.style.setProperty('--scroll-y', `${-22 + progress * 44}%`);
      document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(3));
      
      // Лёгкий параллакс для контейнера частиц
      const particles = document.getElementById('particles-container');
      if (particles) {
        particles.style.transform = `translateY(${scrolled * 0.018}px)`;
      }
    };
    
    // Оптимизированный скролл-листнер с throttle через requestAnimationFrame
    let scrollTick = false;
    window.addEventListener('scroll', () => {
      if (!scrollTick) {
        requestAnimationFrame(() => {
          updateScrollVars();
          scrollTick = false;
        });
        scrollTick = true;
      }
    }, { passive: true });
    
    // Первичный вызов
    updateScrollVars();
  };
  initScrollReactivity();
  
  // ========================================
  // 🍔 БУРГЕР-МЕНЮ: ПЛАВНОЕ И ДОСТУПНОЕ
  // ========================================
  const initBurgerMenu = () => {
    const burger = document.getElementById('burger-btn');
    const nav = document.getElementById('main-nav');
    
    if (!burger || !nav) return;
    
    const toggleMenu = (open) => {
      burger.classList.toggle('active', open);
      nav.classList.toggle('active', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
      
      // Анимация появления меню
      if (open) {
        nav.style.opacity = '0';
        nav.style.transform = 'translateY(-8px)';
        requestAnimationFrame(() => {
          nav.style.transition = 'opacity 0.35s var(--ease-breath), transform 0.35s var(--ease-breath)';
          nav.style.opacity = '1';
          nav.style.transform = 'translateY(0)';
        });
      }
    };
    
    // Клик по бургеру
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(!burger.classList.contains('active'));
    });
    
    // Закрытие по клику на ссылку
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
    
    // Закрытие по клику вне меню
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('active') && 
          !nav.contains(e.target) && 
          !burger.contains(e.target)) {
        toggleMenu(false);
      }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        toggleMenu(false);
        burger.focus();
      }
    });
  };
  initBurgerMenu();
  
  // ========================================
  // ✨ ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ: ORGANIC REVEAL
  // ========================================
  const initScrollReveal = () => {
    if (!('IntersectionObserver' in window)) {
      // Fallback: показать всё сразу
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Опционально: прекратить наблюдение после появления
          // observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.14, 
      rootMargin: '0px 0px -25px 0px' 
    });
    
    // Наблюдаем за поэтическими элементами
    const revealTargets = document.querySelectorAll(
      '.poem, .article-card, .event-card, .high-card, .small-card'
    );
    
    revealTargets.forEach(el => {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });
  };
  initScrollReveal();
  
  // ========================================
  // 📜 ПОДГОТОВКА ТЕКСТА СТИХОВ: РАЗБИВКА НА СТРОКИ
  // ========================================
  const initPoemText = () => {
    document.querySelectorAll('.poem-text').forEach(poem => {
      // Пропускаем, если уже разбито
      if (poem.querySelector('.line')) return;
      
      const text = poem.textContent.trim();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Оборачиваем каждую строку в span для анимации
      poem.innerHTML = lines.map(line => 
        `<span class="line">${line.trim()}</span>`
      ).join('');
    });
  };
  initPoemText();
  
  // ========================================
  // 🎨 ДИНАМИЧЕСКАЯ ПАЛИТРА ПО ВРЕМЕНИ СУТОК
  // ========================================
  const initTimeBasedTheme = () => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      let intensity = 1;
      let hueShift = 0;
      
      // Утро (5-9): яркий, тёплый рассвет
      if (hour >= 5 && hour <= 9) {
        intensity = 1.18;
        hueShift = 5;
      }
      // День (10-16): приглушённые, читабельные тона
      else if (hour >= 10 && hour <= 16) {
        intensity = 0.88;
        hueShift = -3;
      }
      // Вечер (17-21): мягкий закат, больше лаванды
      else if (hour >= 17 && hour <= 21) {
        intensity = 1.05;
        hueShift = 12;
      }
      // Ночь (22-4): глубокие, звёздные тона
      else {
        intensity = 0.72;
        hueShift = -8;
      }
      
      // Применяем переменные
      document.documentElement.style.setProperty('--dawn-intensity', intensity.toFixed(2));
      document.documentElement.style.setProperty('--hue-shift', `${hueShift}deg`);
    };
    
    updateTheme();
    // Обновляем раз в 12 минут
    setInterval(updateTheme, 12 * 60 * 1000);
  };
  initTimeBasedTheme();
  
  // ========================================
  // 🎯 ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ
  // ========================================
  
  // Плавный скролл к якорям с учётом высоты хедера
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Ленивая загрузка изображений (если есть)
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img:not([loading])').forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }
  
  // Обработка ошибок загрузки изображений
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      this.style.opacity = '0.6';
      this.style.filter = 'grayscale(40%)';
      this.alt = this.alt || 'Изображение';
    });
  });
  
  // 🔊 ОПЦИОНАЛЬНО: ФОНОВЫЙ ЭМБИЕНТ (раскомментируй при необходимости)
  /*
  const initAmbientSound = () => {
    const audio = new Audio('/assets/dawn-ambient.mp3');
    audio.loop = true;
    audio.volume = 0.12;
    
    const toggleBtn = document.getElementById('sound-toggle');
    if (!toggleBtn) return;
    
    let isPlaying = false;
    
    toggleBtn.addEventListener('click', async () => {
      try {
        if (isPlaying) {
          audio.pause();
          toggleBtn.setAttribute('aria-pressed', 'false');
          toggleBtn.textContent = '🔇';
        } else {
          await audio.play();
          toggleBtn.setAttribute('aria-pressed', 'true');
          toggleBtn.textContent = '🔊';
        }
        isPlaying = !isPlaying;
      } catch (err) {
        console.warn('Autoplay blocked:', err);
        toggleBtn.textContent = '⚠️';
      }
    });
    
    // Остановка при скрытии вкладки (экономия ресурсов)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isPlaying) {
        audio.volume = 0.03;
      } else if (isPlaying) {
        audio.volume = 0.12;
      }
    });
  };
  // initAmbientSound();
  */
  
  // 🎉 ЛОГ: загрузка завершена
  console.log('🌅 AETHERIAL DAWN: Поэзия обрела дыхание • v2.0');
});