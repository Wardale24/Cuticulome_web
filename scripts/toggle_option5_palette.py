from pathlib import Path
import shutil
import sys

APP_DIR = Path("app")
BACKUP_DIR = Path(".palette-option5-backup")

OPTION_5_MAPPING = {
    # Backgrounds
    "#f7f2e8": "#f8fafc",
    "#fffaf1": "#f1f5f9",
    "#fffdf8": "#ffffff",
    "#efe5d4": "#ffedd5",
    "#eadfca": "#e2e8f0",
    "#fff7ea": "#fff7ed",
    "#fff1ed": "#fff7ed",
    "#f0ded8": "#fed7aa",

    # Text
    "#2a2118": "#172033",
    "#221d18": "#172033",
    "#6a5d4d": "#5b677a",
    "#9a8b78": "#8a94a6",
    "#b8aa96": "#94a3b8",

    # Borders / lines
    "#d8cbb7": "#d8dee8",
    "#e5d9c6": "#d8dee8",
    "#c8b89d": "#cbd5e1",
    "#cdbb9e": "#d8dee8",

    # Accents / hovers
    "#8c3f2b": "#b45309",
    "#6a2f24": "#92400e",
    "#453729": "#334155",
    "#bfa98a": "#b45309",
    "#c48a7a": "#f59e0b",

    # Existing green/yellow utility colors, cleaned but kept distinct
    "#486338": "#166534",
    "#dfead8": "#dcfce7",
    "#f1f8ed": "#f0fdf4",
    "#b8cfaa": "#bbf7d0",
    "#fff0c7": "#fef3c7",
    "#e8e1c5": "#fde68a",
    "#80611c": "#b45309",
    "#735c1f": "#92400e",
}

VALID_SUFFIXES = {".tsx", ".ts", ".css"}


def get_app_files():
    if not APP_DIR.exists():
        raise SystemExit("Could not find app/ directory. Run this from the project root.")

    return sorted(
        path
        for path in APP_DIR.rglob("*")
        if path.is_file() and path.suffix in VALID_SUFFIXES
    )


def backup_file(path: Path):
    backup_path = BACKUP_DIR / path

    if backup_path.exists():
        return

    backup_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, backup_path)


def apply_palette():
    changed_files = []

    for path in get_app_files():
        original = path.read_text()
        updated = original

        for old_color, new_color in OPTION_5_MAPPING.items():
            updated = updated.replace(old_color, new_color)

        if updated != original:
            backup_file(path)
            path.write_text(updated)
            changed_files.append(path)

    print(f"Applied Option 5 palette to {len(changed_files)} file(s).")
    print(f"Original files are backed up in: {BACKUP_DIR}")


def revert_palette():
    if not BACKUP_DIR.exists():
        raise SystemExit("No palette backup found. Nothing to revert.")

    restored_files = []

    for backup_path in sorted(BACKUP_DIR.rglob("*")):
        if not backup_path.is_file():
            continue

        relative_path = backup_path.relative_to(BACKUP_DIR)
        target_path = Path(relative_path)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(backup_path, target_path)
        restored_files.append(target_path)

    print(f"Restored {len(restored_files)} file(s) from palette backup.")


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in {"apply", "revert"}:
        raise SystemExit(
            "Usage:\n"
            "  python scripts/toggle_option5_palette.py apply\n"
            "  python scripts/toggle_option5_palette.py revert"
        )

    if sys.argv[1] == "apply":
        apply_palette()
    else:
        revert_palette()


if __name__ == "__main__":
    main()
