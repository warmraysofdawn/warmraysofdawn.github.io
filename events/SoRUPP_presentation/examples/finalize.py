#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Finalize Themes Migration
- Находит папки с styles.css
- Переносит в themes/ с именем папки (в lowercase)
- Обновляет ссылки в index.html
- Удаляет пустые папки
"""

import os
import shutil
import re
from pathlib import Path

# === НАСТРОЙКИ ===
BASE_DIR = Path("events/SoRUPP_presentation/examples")
THEMES_DIR = BASE_DIR / "themes"
MAIN_INDEX = BASE_DIR / "index.html"

def log(msg):
    print(f"[✓] {msg}")

def warn(msg):
    print(f"[!] {msg}")

def find_theme_folders():
    """Находит все папки, содержащие styles.css"""
    themes = {}
    for item in BASE_DIR.iterdir():
        if item.is_dir():
            css = item / "styles.css"
            if css.exists():
                themes[item.name] = css
    return themes

def migrate_themes(themes):
    """Переносит styles.css -> themes/name.css (lowercase)"""
    THEMES_DIR.mkdir(exist_ok=True)
    migrated = {}
    
    for folder_name, css_path in themes.items():
        # Приводим имя к lowercase для безопасности
        theme_name = folder_name.lower()
        # Заменяем пробелы и спецсимволы на дефисы
        theme_name = re.sub(r'[^a-z0-9_-]', '-', theme_name)
        theme_name = re.sub(r'-+', '-', theme_name).strip('-')
        
        target = THEMES_DIR / f"{theme_name}.css"
        shutil.copy2(css_path, target)
        migrated[folder_name] = theme_name
        
        if folder_name != theme_name:
            log(f"Миграция: {folder_name}/styles.css -> themes/{theme_name}.css")
        else:
            log(f"Миграция: {folder_name}/styles.css -> themes/{theme_name}.css")
    
    return migrated

def update_index_links(migrated):
    """Обновляет ссылки в index.html"""
    if not MAIN_INDEX.exists():
        warn("index.html не найден, пропускаю обновление ссылок.")
        return
    
    content = MAIN_INDEX.read_text(encoding="utf-8")
    updated = 0
    
    for old_name, new_name in migrated.items():
        # Паттерны для замены
        patterns = [
            # Ссылки вида ?theme=OldName -> ?theme=newname
            (rf'(\?theme=){re.escape(old_name)}(["\'&])', rf'\1{new_name}\2'),
            # Ссылки вида /old-name/ -> /demo.html?theme=newname
            (rf'(href=["\'][^"\']*){re.escape(old_name)}/(["\'])', rf'\1demo.html?theme={new_name}\2'),
        ]
        
        for pattern, replacement in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
                updated += 1
    
    MAIN_INDEX.write_text(content, encoding="utf-8")
    log(f"Обновлено ссылок в index.html: {updated}")

def cleanup_folders(themes):
    """Удаляет старые папки тем, если там остался только styles.css"""
    for folder_name in themes.keys():
        folder_path = BASE_DIR / folder_name
        if folder_path.exists():
            # Проверяем, что папка пуста или содержит только styles.css
            items = list(folder_path.iterdir())
            styles_css = folder_path / "styles.css"
            
            if all(item == styles_css for item in items):
                shutil.rmtree(folder_path)
                log(f"Удалена пустая папка: {folder_name}/")
            else:
                # Если есть другие файлы, удаляем только styles.css
                if styles_css.exists():
                    styles_css.unlink()
                    log(f"Удален styles.css из {folder_name}/ (папка не пуста)")
                warn(f"Папка {folder_name}/ содержит другие файлы, проверьте вручную.")

def main():
    print("\n=== Finalize Themes Migration ===\n")
    
    if not BASE_DIR.exists():
        print(f"[✗] Папка не найдена: {BASE_DIR}")
        return
    
    themes = find_theme_folders()
    
    if not themes:
        log("Оставшихся папок с styles.css не найдено. Всё готово!")
        return
    
    log(f"Найдено папок для миграции: {len(themes)}")
    for name in themes:
        print(f"  - {name}/")
    
    migrated = migrate_themes(themes)
    update_index_links(migrated)
    cleanup_folders(themes)
    
    print("\n=== Миграция завершена ===")
    print(f"\nНовые темы в themes/:")
    for _, new_name in migrated.items():
        print(f"  - {new_name}.css")
    
    print(f"\nСсылки в index.html обновлены (приведены к lowercase).")
    print(f"Проверьте: {MAIN_INDEX}")

if __name__ == "__main__":
    main()