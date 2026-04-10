class ThemeManager {
    constructor() {
        this.currentTheme = 'dreamcore';
        this.activeStylesheet = null;
        this.parallaxElements = [];
        this.floatingEmojis = [];
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.themes = {
            dreamcore: {
                particles: 'dream',
                effects: ['dream-glow', 'fog-overlay']
            },
            cutecore: {
                particles: 'cute',
                effects: ['bounce-cards', 'floating-emojis', 'pulse-accent']
            },
            altcore: {
                particles: 'matrix',
                effects: ['glitch-text', 'scanline-overlay', 'terminal-cursor']
            },
            islamic: {
                particles: 'islamic',
                effects: ['geometric-pattern', 'golden-glow', 'corner-ornaments']
            }
        };
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.setupParallax();
        this.setupThemeButtons();
        this.setupMotionPreference();
        this.initBackgroundParticles();
        
        console.log(`🎨 ThemeManager initialized: ${this.currentTheme}`);
    }
    
    async switchTheme(themeName) {
        if (!this.themes[themeName] || themeName === this.currentTheme) return;
        
        if (this.activeStylesheet) {
            this.activeStylesheet.remove();
        }
        
        document.body.classList.remove('theme-dreamcore', 'theme-cutecore', 'theme-altcore', 'theme-islamic');
        document.body.classList.add(`theme-${themeName}`);
        
        this.activeStylesheet = await this.loadStylesheet(`css/${themeName}.css`);
        this.updateThemeButtons(themeName);
        this.triggerThemeEffects(themeName);
        this.updateBackgroundParticles(themeName);
        this.refreshComponents();
        
        localStorage.setItem('preferred-theme', themeName);
        this.currentTheme = themeName;
        
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
    }
    
    loadStylesheet(href) {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve(link);
            link.onerror = () => { console.warn(`⚠️ Failed: ${href}`); resolve(null); };
            document.head.appendChild(link);
        });
    }
    
    updateThemeButtons(theme) {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            const isActive = btn.dataset.theme === theme;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });
    }
    
    setupThemeButtons() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTheme(e.currentTarget.dataset.theme);
            });
        });
        
        const saved = localStorage.getItem('preferred-theme');
        if (saved && this.themes[saved]) this.switchTheme(saved);
    }
    
    triggerThemeEffects(theme) {
        this.cleanupEffects();
        
        switch(theme) {
            case 'cutecore':
                this.enableCutecoreEffects();
                break;
            case 'altcore':
                this.enableAltcoreEffects();
                break;
            case 'islamic':
                this.enableIslamicEffects();
                break;
            default:
                this.enableDreamcoreEffects();
        }
    }
    
    enableDreamcoreEffects() {
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
            });
        });
        
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                btn.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
                btn.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
            });
        });
    }
    
    enableCutecoreEffects() {
        if (!this.isReducedMotion) {
            this.spawnFloatingEmojis(['💖', '✨', '🌸', '🎀', '🦋', '💕'], 15);
        }
    }
    
    enableAltcoreEffects() {
        document.querySelectorAll('.card').forEach((card, i) => {
            card.dataset.line = String(i + 1).padStart(2, '0');
        });
    }
    
    enableIslamicEffects() {
        this.addCornerOrnaments();
    }
    
    cleanupEffects() {
        this.floatingEmojis.forEach(el => el.remove());
        this.floatingEmojis = [];
        
        document.querySelectorAll('.corner-ornament').forEach(el => el.remove());
    }
    
    spawnFloatingEmojis(emojis, count) {
        this.cleanupEffects();
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const emoji = document.createElement('span');
                emoji.className = 'floating-emoji';
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.left = `${Math.random() * 100}vw`;
                emoji.style.top = `${100 + Math.random() * 20}vh`;
                emoji.style.fontSize = `${1 + Math.random() * 1.5}rem`;
                document.body.appendChild(emoji);
                this.floatingEmojis.push(emoji);
                
                setTimeout(() => {
                    emoji.remove();
                    const idx = this.floatingEmojis.indexOf(emoji);
                    if (idx > -1) this.floatingEmojis.splice(idx, 1);
                }, 7000);
            }, i * 300);
        }
    }
    
    addCornerOrnaments() {
        if (document.querySelector('.corner-ornament')) return;
        
        ['✦', '❖', '❋', '✦'].forEach((char, i) => {
            const orn = document.createElement('span');
            orn.className = 'corner-ornament';
            orn.textContent = char;
            const positions = ['top:20px;left:20px', 'top:20px;right:20px', 'bottom:20px;left:20px', 'bottom:20px;right:20px'];
            orn.style.cssText = `position:fixed;${positions[i]};font-size:1.5rem;color:var(--accent);opacity:0.3;pointer-events:none;z-index:1;animation:ornamental-pulse 4s ease-in-out ${i * 0.5}s infinite;`;
            document.body.appendChild(orn);
        });
    }
    
    setupParallax() {
        this.parallaxElements = document.querySelectorAll('[data-parallax-speed]');
        if (!this.parallaxElements.length || this.isReducedMotion) return;
        
        window.addEventListener('scroll', this.throttle(this.handleParallax.bind(this), 16), { passive: true });
    }
    
    handleParallax() {
        const scrollY = window.scrollY || window.pageYOffset;
        this.parallaxElements.forEach(el => {
            if (window.innerWidth < 768 && el.dataset.disableMobile === 'true') return;
            
            const speed = parseFloat(el.dataset.parallaxSpeed) || 0.3;
            const dir = el.dataset.parallaxDir || 'y';
            const offset = scrollY * speed;
            
            if (dir === 'y') el.style.transform = `translateY(${offset}px)`;
            else if (dir === 'x') el.style.transform = `translateX(${offset * 0.3}px)`;
            else if (dir === 'xy') el.style.transform = `translate(${offset * 0.2}px, ${offset}px)`;
        });
    }
    
    throttle(fn, limit) {
        let inThrottle;
        return (...args) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } };
    }
    
    initBackgroundParticles() {
        const type = this.themes[this.currentTheme]?.particles || 'dream';
        if (typeof window.initParticles === 'function') window.initParticles(type);
    }
    
    updateBackgroundParticles(theme) {
        const type = this.themes[theme]?.particles || 'dream';
        if (typeof window.updateParticles === 'function') window.updateParticles(type);
    }
    
    refreshComponents() {
        if (typeof window.initQR === 'function') window.initQR();
        if (typeof window.updateGraphStyle === 'function') window.updateGraphStyle();
        if (typeof window.refreshGallery === 'function') window.refreshGallery();
    }
    
    setupMotionPreference() {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        mq.addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            if (e.matches) {
                this.parallaxElements.forEach(el => el.style.transform = '');
                if (typeof window.stopParticles === 'function') window.stopParticles();
            }
        });
    }
    
    applyTheme(name) {
        if (this.themes[name]) {
            document.body.classList.add(`theme-${name}`);
            this.currentTheme = name;
            this.updateThemeButtons(name);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.setTheme = (name) => window.themeManager?.switchTheme(name);
});