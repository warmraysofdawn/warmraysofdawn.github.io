/**
 * Main Application Logic
 * Slide navigation, QR generation, Cytoscape graph, gallery
 */

// ===== GLOBAL STATE =====
const AppState = {
    currentSlide: 0,
    totalSlides: 0,
    cy: null, // Cytoscape instance
    particles: [],
    animationFrame: null
};

// ===== SLIDE NAVIGATION =====
class SlideManager {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.total = this.slides.length;
        AppState.totalSlides = this.total;
        
        this.progressBar = document.getElementById('progressBar');
        this.noteText = document.getElementById('noteText');
        this.speakerNotes = document.getElementById('speakerNotes');
        this.dotsContainer = document.getElementById('navDots');
        
        this.init();
    }
    
    init() {
        // Создаём навигационные точки
        this.createNavDots();
        
        // Показываем первый слайд
        this.goToSlide(0);
        
        // Навешиваем обработчики
        this.setupEventListeners();
        
        // Инициализируем заметки докладчика
        this.updateSpeakerNotes(0);
        
        console.log(`📊 SlideManager: ${this.total} slides loaded`);
    }
    
    createNavDots() {
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'n-dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
            dot.setAttribute('aria-selected', index === 0);
            dot.dataset.slide = index;
            
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }
    
    goToSlide(index) {
        // Границы
        if (index < 0) index = this.total - 1;
        if (index >= this.total) index = 0;
        
        // Обновляем слайды
        this.slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev', 'next');
            slide.setAttribute('aria-hidden', i !== index);
            
            if (i === index) {
                slide.classList.add('active');
            } else if (i === index - 1) {
                slide.classList.add('prev');
            } else if (i === index + 1) {
                slide.classList.add('next');
            }
        });
        
        // Обновляем точки
        document.querySelectorAll('.n-dot').forEach((dot, i) => {
            const isActive = i === index;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive);
        });
        
        // Прогресс бар
        const progress = ((index + 1) / this.total) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressBar.setAttribute('aria-valuenow', Math.round(progress));
        
        // Заметки
        this.updateSpeakerNotes(index);
        
        // Обновляем состояние
        AppState.currentSlide = index;
        
        // Событие
        document.dispatchEvent(new CustomEvent('slideChanged', { 
            detail: { slide: index, total: this.total } 
        }));
    }
    
    updateSpeakerNotes(index) {
        const slide = this.slides[index];
        const note = slide?.dataset.note || '';
        
        if (note && this.noteText) {
            this.noteText.textContent = note;
            this.speakerNotes?.classList.remove('hidden');
        } else {
            this.speakerNotes?.classList.add('hidden');
        }
    }
    
    setupEventListeners() {
        // Кнопки навигации
        document.getElementById('prevBtn')?.addEventListener('click', () => {
            this.goToSlide(AppState.currentSlide - 1);
        });
        
        document.getElementById('nextBtn')?.addEventListener('click', () => {
            this.goToSlide(AppState.currentSlide + 1);
        });
        
        // Клавиатура
        document.addEventListener('keydown', (e) => {
            // Игнорируем если фокус на input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'PageDown':
                    e.preventDefault();
                    this.goToSlide(AppState.currentSlide + 1);
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.goToSlide(AppState.currentSlide - 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.total - 1);
                    break;
                case 'n':
                case 'N':
                    // Toggle speaker notes
                    this.speakerNotes?.classList.toggle('hidden');
                    break;
            }
        });
        
        // Тач-свайпы
        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.goToSlide(AppState.currentSlide + 1);
                } else {
                    this.goToSlide(AppState.currentSlide - 1);
                }
            }
        }, { passive: true });
        
        // Клик по точкам
        this.dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('n-dot')) {
                const index = parseInt(e.target.dataset.slide);
                this.goToSlide(index);
            }
        });
    }
}

// ===== QR CODE GENERATION =====
function initQR() {
    const container = document.getElementById('qrContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Получаем цвета из CSS переменных
    const styles = getComputedStyle(document.body);
    const fg = styles.getPropertyValue('--qr-fg').trim() || '#1e1b4b';
    const bg = styles.getPropertyValue('--qr-bg').trim() || '#ffffff';
    
    const qrData = [
        { text: 'https://github.com/warmraysofdawn/SoRUPP', label: 'GitHub' },
        { text: 'https://warmraysofdawn.github.io/events/SoRUPP_presentation/', label: 'Презентация' }
    ];
    
    qrData.forEach((item, index) => {
        const box = document.createElement('div');
        box.className = 'qr-box';
        box.setAttribute('role', 'listitem');
        
        const id = `qr-${Date.now()}-${index}`;
        box.innerHTML = `<div id="${id}"></div><span class="qr-label">${item.label}</span>`;
        container.appendChild(box);
        
        // Генерируем QR
        if (typeof QRCode !== 'undefined') {
            new QRCode(document.getElementById(id), {
                text: item.text,
                width: 110,
                height: 110,
                colorDark: fg,
                colorLight: bg,
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    });
}

// ===== CYTOSCAPE GRAPH =====
// ===== ИСПРАВЛЕННЫЙ graphData (были синтаксические ошибки) =====
const graphData = {
    elements: {
        nodes: [
            { data: { id: '1', label: 'Бэкенд', group: 'prog' } },
            { data: { id: '2', label: 'Фронтенд', group: 'prog' } },
            { data: { id: '3', label: 'Роман', group: 'lit' } },
            { data: { id: '4', label: 'Концепт', group: 'art' } },
            { data: { id: '5', label: 'Статья', group: 'sci' } },
            { data: { id: '6', label: 'Дизайн', group: 'art' } }
        ],
        edges: [
            { data: { source: '1', target: '2' } },
            { data: { source: '1', target: '5' } },
            { data: { source: '2', target: '6' } },
            { data: { source: '4', target: '6' } },
            { data: { source: '3', target: '5' } }
        ]
    }
};

function getThemeColors() {
    const style = getComputedStyle(document.body);
    return {
        prog: style.getPropertyValue('--accent').trim() || '#a78bfa',
        lit: '#f472b6',
        art: '#c084fc',
        sci: '#34d399',
        edge: style.getPropertyValue('--text-secondary').trim() || '#666'
    };
}

function initGraph() {
    const container = document.getElementById('cy');
    if (!container || typeof cytoscape === 'undefined') return;
    
    const colors = getThemeColors();
    
    AppState.cy = cytoscape({
        container: container,
        elements: graphData.elements,
        
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'color': '#fff',
                    'font-size': '11px',
                    'font-family': 'var(--font-body)',
                    'width': 55,
                    'height': 55,
                    'background-color': (ele) => colors[ele.data('group')] || '#999',
                    'border-width': 2,
                    'border-color': 'rgba(255,255,255,0.4)',
                    'shadow-blur': 15,
                    'shadow-color': (ele) => colors[ele.data('group')] || '#999',
                    'shadow-opacity': 0.6
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': colors.edge,
                    'target-arrow-color': colors.edge,
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'opacity': 0.7
                }
            },
            {
                selector: '.highlighted',
                style: {
                    'border-width': 3,
                    'border-color': '#fff',
                    'shadow-blur': 25,
                    'shadow-opacity': 0.9
                }
            }
        ],
        
        layout: {
            name: 'cose',
            padding: 40,
            animate: true,
            animationDuration: 500,
            fit: true
        },
        
        // Интерактивность
        minZoom: 0.5,
        maxZoom: 2,
        wheelSensitivity: 0.2
    });
    
    // Обработчики событий
    AppState.cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        
        // Подсветка связанных элементов
        AppState.cy.elements().removeClass('highlighted');
        node.connectedEdges().addClass('highlighted');
        node.neighborhood().addClass('highlighted');
        node.addClass('highlighted');
    });
    
    AppState.cy.on('tap', function(evt) {
        if (evt.target === AppState.cy) {
            AppState.cy.elements().removeClass('highlighted');
        }
    });
    
    console.log('🕸️ Graph initialized');
}

function fitGraph() {
    if (AppState.cy) {
        AppState.cy.animate({ fit: { padding: 30 }, duration: 400 });
    }
}

function resetGraphLayout() {
    if (AppState.cy) {
        AppState.cy.layout({
            name: 'cose',
            animate: true,
            animationDuration: 500,
            fit: true,
            padding: 40
        }).run();
    }
}

function updateGraphStyle() {
    if (!AppState.cy) return;
    
    const colors = getThemeColors();
    
    // Обновляем стили динамически
    AppState.cy.style()
        .selector('node')
        .style({
            'background-color': (ele) => colors[ele.data('group')] || '#999',
            'shadow-color': (ele) => colors[ele.data('group')] || '#999'
        })
        .selector('edge')
        .style({
            'line-color': colors.edge,
            'target-arrow-color': colors.edge
        })
        .update();
}

// ===== GALLERY GENERATION =====
function initGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;
    
    // Цвета для градиентов (меняются с темой)
    const styles = getComputedStyle(document.body);
    const accent = styles.getPropertyValue('--accent').trim() || '#a78bfa';
    const accent2 = styles.getPropertyValue('--accent-secondary').trim() || '#f472b6';
    
    const colors = [
        [accent, accent2],
        [accent2, accent],
        ['#84fab0', '#8fd3f4'],
        ['#fccb90', '#d57eeb'],
        ['#e0c3fc', '#8ec5fc'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7']
    ];
    
    container.innerHTML = '';
    
    colors.forEach((pair, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('role', 'listitem');
        item.setAttribute('aria-label', `Изображение ${index + 1}`);
        item.style.background = `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
        
        // Клик для демо
        item.addEventListener('click', () => {
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = '';
            }, 150);
        });
        
        container.appendChild(item);
    });
}

function refreshGallery() {
    // Пересоздаём галерею с новыми цветами темы
    initGallery();
}

// ===== CANVAS PARTICLES =====
const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    config: { type: 'dream' },
    animationId: null,
    
    init(type = 'dream') {
        this.canvas = document.getElementById('canvas-bg');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.config.type = type;
        
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        
        console.log(`✨ Particles initialized: ${this.config.type}`);
    },
    
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    createParticles() {
        this.particles = [];
        const count = this.config.type === 'matrix' ? 70 : 100;
        
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    },
    
    createParticle() {
        const type = this.config.type;
        const p = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            alpha: Math.random() * 0.5 + 0.1
        };
        
        if (type === 'dream') {
            p.vx = (Math.random() - 0.5) * 0.4;
            p.vy = (Math.random() - 0.5) * 0.4;
            p.color = `rgba(${150 + Math.random()*60}, ${120 + Math.random()*60}, 250, ${p.alpha})`;
        } 
        else if (type === 'cute') {
            p.vx = (Math.random() - 0.5) * 0.6;
            p.vy = (Math.random() - 0.5) * 0.6 - 0.3; // upward bias
            p.color = `rgba(255, ${140 + Math.random()*60}, ${190 + Math.random()*60}, ${p.alpha})`;
            p.emoji = ['💖','✨','🌸','🎀'][Math.floor(Math.random()*4)];
        } 
        else if (type === 'matrix') {
            p.x = Math.random() * this.canvas.width;
            p.y = Math.random() * -this.canvas.height;
            p.vy = Math.random() * 2 + 1.5;
            p.vx = (Math.random() - 0.5) * 0.5;
            p.char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
            p.size = Math.random() * 12 + 10;
            p.color = `rgba(0, 255, 0, ${Math.random() * 0.8 + 0.2})`;
        } 
        else if (type === 'islamic') {
            p.vx = (Math.random() - 0.5) * 0.3;
            p.vy = (Math.random() - 0.5) * 0.3;
            p.color = `rgba(212, 175, 55, ${p.alpha})`;
            p.shape = Math.random() > 0.5 ? 'star' : 'diamond';
        }
        
        return p;
    },
    
    updateParticle(p) {
        if (this.config.type === 'matrix') {
            p.y += p.vy;
            p.x += p.vx;
            if (p.y > this.canvas.height) {
                p.y = -20;
                p.x = Math.random() * this.canvas.width;
            }
        } else {
            p.x += p.vx;
            p.y += p.vy;
            
            // Bounce off edges
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
        }
    },
    
    drawParticle(p) {
        this.ctx.globalAlpha = p.alpha;
        
        if (this.config.type === 'matrix') {
            this.ctx.fillStyle = p.color;
            this.ctx.font = `${p.size}px monospace`;
            this.ctx.fillText(p.char, p.x, p.y);
        } 
        else if (this.config.type === 'islamic') {
            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            
            if (p.shape === 'star') {
                // 5-point star
                const spikes = 5, outerRadius = p.size, innerRadius = p.size * 0.4;
                let rot = Math.PI / 2 * 3;
                let step = Math.PI / spikes;
                
                this.ctx.moveTo(p.x, p.y - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    this.ctx.lineTo(p.x + Math.cos(rot) * outerRadius, p.y + Math.sin(rot) * outerRadius);
                    rot += step;
                    this.ctx.lineTo(p.x + Math.cos(rot) * innerRadius, p.y + Math.sin(rot) * innerRadius);
                    rot += step;
                }
                this.ctx.closePath();
            } else {
                // Diamond
                this.ctx.moveTo(p.x, p.y - p.size * 2);
                this.ctx.lineTo(p.x + p.size, p.y);
                this.ctx.lineTo(p.x, p.y + p.size * 2);
                this.ctx.lineTo(p.x - p.size, p.y);
                this.ctx.closePath();
            }
            this.ctx.stroke();
        } 
        else if (this.config.type === 'cute' && p.emoji) {
            this.ctx.font = `${p.size * 3}px serif`;
            this.ctx.fillText(p.emoji, p.x, p.y);
        } 
        else {
            // Dream: glowing circles
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Glow effect
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    },
    
    drawConnections() {
        if (this.config.type === 'matrix') return;
        
        this.ctx.lineWidth = 0.4;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    const alpha = (1 - dist / 120) * 0.2;
                    
                    if (this.config.type === 'islamic') {
                        this.ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
                    } else {
                        this.ctx.strokeStyle = `rgba(200,200,255,${alpha})`;
                    }
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    },
    
    animate() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            this.updateParticle(p);
            this.drawParticle(p);
        });
        
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },
    
    updateType(type) {
        this.config.type = type;
        this.createParticles();
    }
};

// ===== ДОБАВИТЬ В КОНЕЦ ФАЙЛА =====

/**
 * Инициализация галереи с анимацией появления
 */
function initGalleryAnimated() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;
    
    const styles = getComputedStyle(document.body);
    const accent = styles.getPropertyValue('--accent').trim() || '#a78bfa';
    const accent2 = styles.getPropertyValue('--accent-secondary').trim() || '#f472b6';
    
    const colorPairs = [
        [accent, accent2],
        [accent2, accent],
        ['#84fab0', '#8fd3f4'],
        ['#fccb90', '#d57eeb'],
        ['#e0c3fc', '#8ec5fc'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7']
    ];
    
    container.innerHTML = '';
    
    colorPairs.forEach((pair, index) => {
        const item = document.createElement('button');
        item.className = 'gallery-item';
        item.setAttribute('role', 'listitem');
        item.setAttribute('aria-label', `Изображение ${index + 1}`);
        item.style.background = `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        
        // Анимация появления с задержкой
        setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        }, index * 80);
        
        // Клик-эффект
        item.addEventListener('click', (e) => {
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
            }, 150);
            
            // Можно добавить модалку или лайтбокс здесь
            console.log(`Gallery item ${index + 1} clicked`);
        });
        
        // Hover-эффект через CSS уже есть, но можно усилить
        item.addEventListener('mouseenter', () => {
            item.style.zIndex = '10';
        });
        item.addEventListener('mouseleave', () => {
            item.style.zIndex = '';
        });
        
        container.appendChild(item);
    });
}

/**
 * Обновление галереи при смене темы
 */
function refreshGallery() {
    initGalleryAnimated();
}

/**
 * Инициализация интерактивных мокапов
 */
function initMockupInteractions() {
    // Вкладки в мокапах
    document.querySelectorAll('.mockup-tabs').forEach(tabContainer => {
        const tabs = tabContainer.querySelectorAll('.mock-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                
                // Можно добавить логику смены контента здесь
                const area = tabContainer.closest('.mockup')?.querySelector('.mockup-active-area');
                if (area) {
                    area.textContent = `Контент: ${tab.textContent.trim()}`;
                    area.style.animation = 'fadeInUp 0.3s ease';
                }
            });
        });
    });
    
    // Кнопки в формах
    document.querySelectorAll('.btn-primary, .btn-accent').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Визуальный фидбэк
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
            
            // Для демо: показываем сообщение
            if (!this.dataset.action) {
                e.preventDefault();
                showTemporaryMessage('Действие выполнено ✓', 2000);
            }
        });
    });
}

/**
 * Показать временное сообщение
 */
function showTemporaryMessage(text, duration = 2000) {
    // Удаляем старые
    document.querySelectorAll('.temp-message').forEach(el => el.remove());
    
    const msg = document.createElement('div');
    msg.className = 'temp-message';
    msg.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 0.9rem;
        color: var(--text-primary);
        z-index: 1000;
        backdrop-filter: blur(10px);
        animation: fadeInUp 0.3s ease, fadeOutDown 0.3s ease ${duration - 300}ms forwards;
    `;
    msg.textContent = text;
    
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), duration);
}

// Добавляем анимацию исчезновения в base.css динамически
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOutDown {
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);

/**
 * Инициализация частиц с поддержкой темы
 */
function initParticlesWithTheme(type) {
    if (typeof ParticleSystem?.init === 'function') {
        ParticleSystem.init(type);
    }
}

function updateParticlesWithTheme(type) {
    if (typeof ParticleSystem?.updateType === 'function') {
        ParticleSystem.updateType(type);
    }
}

// ===== ОБНОВЛЁННАЯ ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем менеджеры
    window.slideManager = new SlideManager();
    
    // Компоненты
    initQR();
    initGraph();
    initGalleryAnimated(); // Используем анимированную версию
    initMockupInteractions();
    
    // Частицы
    initParticlesWithTheme('dream');
    
    // Слушаем смену темы
    document.addEventListener('themeChanged', (e) => {
        initQR();
        updateGraphStyle();
        refreshGallery();
        updateParticlesWithTheme(e.detail.theme);
    });
    
    // Глобальные обработчики клавиш для демо
    document.addEventListener('keydown', (e) => {
        // T: показать сообщение (для тестов)
        if (e.key.toLowerCase() === 't' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            showTemporaryMessage('Тестовое сообщение 🎉', 1500);
        }
    });
    
    // Отладка: лог при загрузке
    console.group('🚀 Application Initialized');
    console.log('Slides:', window.slideManager?.total || 0);
    console.log('Theme:', window.themeManager?.currentTheme || 'unknown');
    console.log('Particles:', ParticleSystem?.config?.type || 'none');
    console.log('Reduced Motion:', window.themeManager?.isReducedMotion || false);
    console.groupEnd();
});

// ===== ЭКСПОРТЫ ДЛЯ ГЛОБАЛЬНОГО ДОСТУПА =====
window.fitGraph = fitGraph;
window.resetGraphLayout = resetGraphLayout;
window.initQR = initQR;
window.refreshGallery = refreshGallery;
window.showTemporaryMessage = showTemporaryMessage;
window.initParticles = initParticlesWithTheme;
window.updateParticles = updateParticlesWithTheme;

// Экспортируем функции для ThemeManager
window.initParticles = (type) => ParticleSystem.init(type);
window.updateParticles = (type) => ParticleSystem.updateType(type);
window.stopParticles = () => ParticleSystem.stop();

// ===== MOCKUP TABS INTERACTION =====
function initMockupTabs() {
    document.querySelectorAll('.mockup-tabs').forEach(tabContainer => {
        const tabs = tabContainer.querySelectorAll('.mock-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Обновляем aria
                tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
                tab.setAttribute('aria-selected', 'true');
            });
        });
    });
}

