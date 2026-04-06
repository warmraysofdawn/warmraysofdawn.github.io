#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SoRUPP Examples Optimizer v2
- Дедуплицирует HTML (включая все подстраницы: works, graph, gallery, downloads)
- Выносит стили в themes/
- Внедряет авто-загрузчик тем и проброс параметра theme в ссылки
"""

import os
import shutil
import re
from pathlib import Path
from collections import defaultdict

# === НАСТРОЙКИ ===
BASE_DIR = Path("events/SoRUPP_presentation/examples")
BACKUP_DIR = Path("events/SoRUPP_presentation/examples_backup")
THEMES_DIR = BASE_DIR / "themes"
MAIN_INDEX = BASE_DIR / "index.html"
TEMPLATE_NAME = "demo.html"

# 1. Скрипт загрузки CSS (вставляется в <head>)
THEME_LOADER_SCRIPT = """
<!-- Theme Loader -->
<script>
(function() {
    const params = new URLSearchParams(location.search);
    const theme = params.get('theme') || 'default';
    const safeTheme = theme.replace(/[^a-z0-9_-]/gi, '');
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // Вычисляем относительный путь: если мы в подпапке (works/), добавляем ../
    const prefix = location.pathname.split('/').filter(Boolean).pop().includes('.') ? '' : '../';
    link.href = prefix + 'themes/' + safeTheme + '.css';
    document.head.appendChild(link);
    
    document.documentElement.setAttribute('data-theme', safeTheme);
})();
</script>
"""

# 2. Скрипт проброса темы в ссылки (вставляется перед </body>)
# Он находит все внутренние ссылки и добавляет к ним ?theme=..., сохраняя навигацию
THEME_PROPAGATOR_SCRIPT = """
<!-- Theme Propagator -->
<script>
(function() {
    const params = new URLSearchParams(location.search);
    const theme = params.get('theme');
    if (!theme) return;

    function updateLinks() {
        document.querySelectorAll('a[href]').forEach(link => {
            // Пропускаем внешние ссылки и якоря
            if (link.href.startsWith('#') || link.href.startsWith('mailto:')) return;
            if (link.href.startsWith('http') && !link.href.includes(location.host)) return;

            try {
                const url = new URL(link.getAttribute('href'), location.href);
                // Обновляем только ссылки внутри examples/
                if (url.pathname.includes('/examples/')) {
                    url.searchParams.set('theme', theme);
                    link.href = url.toString();
                }
            } catch (e) {
                // Игнорируем некорректные URL
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateLinks);
    } else {
        updateLinks();
    }
})();
</script>
"""

def log(msg):
    print(f"[✓] {msg}")

def warn(msg):
    print(f"[!] {msg}")

def create_backup():
    if BACKUP_DIR.exists():
        warn(f"Backup already exists at {BACKUP_DIR}, skipping.")
        return
    log(f"Creating backup at {BACKUP_DIR}...")
    shutil.copytree(BASE_DIR, BACKUP_DIR)
    log("Backup complete.")

def identify_themes():
    """Находит папки тем: папки с styles.css и index.html"""
    themes = {}
    for item in BASE_DIR.iterdir():
        if item.is_dir():
            css = item / "styles.css"
            idx = item / "index.html"
            if css.exists() and idx.exists():
                themes[item.name] = {
                    "path": item,
                    "css": css,
                    "index": idx
                }
    log(f"Found {len(themes)} themes: {', '.join(themes.keys())}")
    return themes

def extract_styles(themes):
    """Переносит styles.css -> themes/name.css"""
    THEMES_DIR.mkdir(exist_ok=True)
    for name, data in themes.items():
        target = THEMES_DIR / f"{name}.css"
        shutil.copy2(data["css"], target)
        log(f"Moved {name}/styles.css -> themes/{name}.css")

def collect_templates(themes):
    """
    Собирает уникальные HTML-шаблоны для всех страниц.
    Сканирует все подпапки (works, graph, gallery, downloads и др.)
    """
    templates = {}
    
    # 1. Главный шаблон
    sample_name = list(themes.keys())[0]
    templates[TEMPLATE_NAME] = themes[sample_name]["index"].read_text(encoding="utf-8")
    log(f"Base template: {TEMPLATE_NAME} (from {sample_name})")
    
    # 2. Сканирование всех подстраниц во всех темах
    subpages = defaultdict(list)
    for name, data in themes.items():
        for root, _, files in os.walk(data["path"]):
            for f in files:
                if f == "index.html":
                    full = Path(root) / f
                    rel = full.relative_to(data["path"])
                    if str(rel) != "index.html":
                        subpages[str(rel)].append(full)
    
    for rel_path, files in subpages.items():
        templates[rel_path] = files[0].read_text(encoding="utf-8")
        log(f"Template: {rel_path} (from {files[0].parent.name})")
        
    return templates

def inject_scripts(html_content):
    """Внедряет загрузчик в <head> и пробросщик перед </body>"""
    result = html_content
    
    if "<head>" in result:
        result = result.replace("<head>", "<head>" + THEME_LOADER_SCRIPT, 1)
    else:
        warn("No <head> tag found, appending loader to top.")
        result = THEME_LOADER_SCRIPT + result
    
    if "</body>" in result:
        result = result.replace("</body>", THEME_PROPAGATOR_SCRIPT + "</body>", 1)
    else:
        result += THEME_PROPAGATOR_SCRIPT
        
    return result

def save_templates(templates):
    for rel_path, content in templates.items():
        target = BASE_DIR / rel_path
        target.parent.mkdir(parents=True, exist_ok=True)
        modified = inject_scripts(content)
        target.write_text(modified, encoding="utf-8")
        log(f"Saved {rel_path}")

def remove_theme_folders(themes):
    for name, data in themes.items():
        shutil.rmtree(data["path"])
        log(f"Removed {name}/")

def update_catalog_links(themes):
    if not MAIN_INDEX.exists():
        warn("Main index.html not found, skipping link updates.")
        return
    
    content = MAIN_INDEX.read_text(encoding="utf-8")
    updated = 0
    
    for name in themes.keys():
        patterns = [
            (f'href="/events/SoRUPP_presentation/examples/{name}/"', 
             f'href="/events/SoRUPP_presentation/examples/{TEMPLATE_NAME}?theme={name}"'),
            (f'href="examples/{name}/"', 
             f'href="examples/{TEMPLATE_NAME}?theme={name}"'),
            (f'href="{name}/"', 
             f'href="{TEMPLATE_NAME}?theme={name}"')
        ]
        for old, new in patterns:
            if old in content:
                content = content.replace(old, new)
                updated += 1
                break
    
    MAIN_INDEX.write_text(content, encoding="utf-8")
    log(f"Updated {updated} links in catalog.")

def main():
    if not BASE_DIR.exists():
        print(f"[✗] Directory not found: {BASE_DIR}")
        return

    print("\n=== SoRUPP Optimizer v2 ===\n")
    
    create_backup()
    themes = identify_themes()
    if not themes:
        print("[✗] No themes found.")
        return
    
    extract_styles(themes)
    templates = collect_templates(themes)
    save_templates(templates)
    remove_theme_folders(themes)
    update_catalog_links(themes)
    
    print("\n=== Готово ===")
    print(f"Структура оптимизирована. Стили в themes/, шаблоны дедуплицированы.")
    print(f"Скрипты автоматически пробрасывают ?theme= во все внутренние ссылки.")
    print(f"Backup: {BACKUP_DIR}")

if __name__ == "__main__":
    main()