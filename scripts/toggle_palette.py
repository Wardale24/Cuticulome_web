from pathlib import Path
import shutil
import sys

APP_DIR = Path("app")
BASELINE_DIR = Path(".palette-baseline-backup")
OLD_OPTION5_BACKUP_DIR = Path(".palette-option5-backup")

VALID_SUFFIXES = {".tsx", ".ts", ".css"}

CURRENT_PALETTE = {
    # Backgrounds
    "#f7f2e8": "page_bg",
    "#fffaf1": "section_bg",
    "#fffdf8": "card_bg",
    "#efe5d4": "soft_fill",
    "#eadfca": "table_header",
    "#fff7ea": "row_hover",
    "#fff1ed": "warning_bg",
    "#f0ded8": "warning_border",

    # Text
    "#2a2118": "primary_text",
    "#221d18": "primary_text",
    "#6a5d4d": "muted_text",
    "#9a8b78": "placeholder_text",
    "#b8aa96": "disabled_text",

    # Borders / lines
    "#d8cbb7": "border",
    "#e5d9c6": "border_light",
    "#c8b89d": "border_strong",
    "#cdbb9e": "border",

    # Accents / hovers
    "#8c3f2b": "accent",
    "#6a2f24": "accent_dark",
    "#453729": "dark_hover",
    "#bfa98a": "hover_border",
    "#c48a7a": "accent_soft",

    # Existing green/yellow utility colors
    "#486338": "success_text",
    "#dfead8": "success_bg",
    "#f1f8ed": "success_bg_soft",
    "#b8cfaa": "success_border",
    "#fff0c7": "notice_bg",
    "#e8e1c5": "notice_border",
    "#80611c": "notice_text",
    "#735c1f": "notice_dark",
}

PALETTES = {
    "option1": {
        # Clean scientific / journal style
        "page_bg": "#f8fafc",
        "section_bg": "#eef6f7",
        "card_bg": "#ffffff",
        "soft_fill": "#ccfbf1",
        "table_header": "#d9eef0",
        "row_hover": "#f0fdfa",
        "warning_bg": "#fff7ed",
        "warning_border": "#fed7aa",

        "primary_text": "#111827",
        "muted_text": "#4b5563",
        "placeholder_text": "#8792a2",
        "disabled_text": "#94a3b8",

        "border": "#dbe4e8",
        "border_light": "#e5edf0",
        "border_strong": "#b8ccd2",
        "hover_border": "#0f766e",

        "accent": "#0f766e",
        "accent_dark": "#115e59",
        "dark_hover": "#1f2937",
        "accent_soft": "#5eead4",

        "success_text": "#166534",
        "success_bg": "#dcfce7",
        "success_bg_soft": "#f0fdf4",
        "success_border": "#bbf7d0",
        "notice_bg": "#fef3c7",
        "notice_border": "#fde68a",
        "notice_text": "#92400e",
        "notice_dark": "#78350f",
    },

    "option2": {
        # Marine biological / Okinawa-adjacent
        "page_bg": "#f3faf8",
        "section_bg": "#e2f2ef",
        "card_bg": "#ffffff",
        "soft_fill": "#d8f3ee",
        "table_header": "#cde8e3",
        "row_hover": "#ecfdf8",
        "warning_bg": "#fff4ed",
        "warning_border": "#fed7aa",

        "primary_text": "#102a2a",
        "muted_text": "#46615f",
        "placeholder_text": "#78908d",
        "disabled_text": "#9fb5b2",

        "border": "#c7ddd8",
        "border_light": "#d8eae6",
        "border_strong": "#a7c9c3",
        "hover_border": "#0f6f73",

        "accent": "#0f6f73",
        "accent_dark": "#0b5457",
        "dark_hover": "#164e63",
        "accent_soft": "#d97757",

        "success_text": "#166534",
        "success_bg": "#dcfce7",
        "success_bg_soft": "#f0fdf4",
        "success_border": "#bbf7d0",
        "notice_bg": "#fef3c7",
        "notice_border": "#fde68a",
        "notice_text": "#b45309",
        "notice_dark": "#92400e",
    },

    "option3": {
        # Dark ink + leaf green
        "page_bg": "#f6f8f3",
        "section_bg": "#edf3e6",
        "card_bg": "#ffffff",
        "soft_fill": "#dfead8",
        "table_header": "#d8e7ce",
        "row_hover": "#f1f8ed",
        "warning_bg": "#fff7ed",
        "warning_border": "#fed7aa",

        "primary_text": "#1f2933",
        "muted_text": "#52616b",
        "placeholder_text": "#84919a",
        "disabled_text": "#9ca3af",

        "border": "#d8e2cf",
        "border_light": "#e4ecdd",
        "border_strong": "#b9c9aa",
        "hover_border": "#3f6f44",

        "accent": "#3f6f44",
        "accent_dark": "#2f5233",
        "dark_hover": "#263238",
        "accent_soft": "#86a878",

        "success_text": "#166534",
        "success_bg": "#dcfce7",
        "success_bg_soft": "#f0fdf4",
        "success_border": "#bbf7d0",
        "notice_bg": "#fef3c7",
        "notice_border": "#fde68a",
        "notice_text": "#854d0e",
        "notice_dark": "#713f12",
    },

    "option4": {
        # Academic blue / database style
        "page_bg": "#f6f8fb",
        "section_bg": "#eaf1fb",
        "card_bg": "#ffffff",
        "soft_fill": "#dbeafe",
        "table_header": "#d7e7fb",
        "row_hover": "#eff6ff",
        "warning_bg": "#fff7ed",
        "warning_border": "#fed7aa",

        "primary_text": "#111827",
        "muted_text": "#4b5563",
        "placeholder_text": "#8792a2",
        "disabled_text": "#94a3b8",

        "border": "#d7e0ec",
        "border_light": "#e4ebf5",
        "border_strong": "#b8c7db",
        "hover_border": "#2563eb",

        "accent": "#2563eb",
        "accent_dark": "#1d4ed8",
        "dark_hover": "#1e293b",
        "accent_soft": "#93c5fd",

        "success_text": "#166534",
        "success_bg": "#dcfce7",
        "success_bg_soft": "#f0fdf4",
        "success_border": "#bbf7d0",
        "notice_bg": "#fef3c7",
        "notice_border": "#fde68a",
        "notice_text": "#854d0e",
        "notice_dark": "#713f12",
    },

    "option5": {
        # Modern charcoal + amber
        "page_bg": "#f8fafc",
        "section_bg": "#f1f5f9",
        "card_bg": "#ffffff",
        "soft_fill": "#ffedd5",
        "table_header": "#e2e8f0",
        "row_hover": "#fff7ed",
        "warning_bg": "#fff7ed",
        "warning_border": "#fed7aa",

        "primary_text": "#172033",
        "muted_text": "#5b677a",
        "placeholder_text": "#8a94a6",
        "disabled_text": "#94a3b8",

        "border": "#d8dee8",
        "border_light": "#d8dee8",
        "border_strong": "#cbd5e1",
        "hover_border": "#b45309",

        "accent": "#b45309",
        "accent_dark": "#92400e",
        "dark_hover": "#334155",
        "accent_soft": "#f59e0b",

        "success_text": "#166534",
        "success_bg": "#dcfce7",
        "success_bg_soft": "#f0fdf4",
        "success_border": "#bbf7d0",
        "notice_bg": "#fef3c7",
        "notice_border": "#fde68a",
        "notice_text": "#b45309",
        "notice_dark": "#92400e",
    },
}


def get_app_files(base: Path = APP_DIR):
    if not base.exists():
        raise SystemExit("Could not find app/ directory. Run this from the project root.")

    return sorted(
        path
        for path in base.rglob("*")
        if path.is_file() and path.suffix in VALID_SUFFIXES
    )


def copy_tree_files(source_root: Path, target_root: Path):
    copied = 0

    for source_path in get_app_files(source_root):
        relative_path = source_path.relative_to(source_root)
        target_path = target_root / relative_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, target_path)
        copied += 1

    return copied


def ensure_baseline():
    if BASELINE_DIR.exists():
        return

    if OLD_OPTION5_BACKUP_DIR.exists():
        BASELINE_DIR.mkdir(parents=True, exist_ok=True)

        for old_backup_file in sorted(OLD_OPTION5_BACKUP_DIR.rglob("*")):
            if not old_backup_file.is_file() or old_backup_file.suffix not in VALID_SUFFIXES:
                continue

            relative_path = old_backup_file.relative_to(OLD_OPTION5_BACKUP_DIR)
            target_path = BASELINE_DIR / relative_path
            target_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(old_backup_file, target_path)

        print(
            f"Created baseline from existing {OLD_OPTION5_BACKUP_DIR} backup."
        )
        return

    BASELINE_DIR.mkdir(parents=True, exist_ok=True)
    copied = copy_tree_files(APP_DIR, BASELINE_DIR / APP_DIR)
    print(f"Created new baseline backup with {copied} file(s).")


def apply_palette(option_name: str):
    if option_name not in PALETTES:
        valid_options = ", ".join(sorted(PALETTES))
        raise SystemExit(f"Unknown palette '{option_name}'. Valid options: {valid_options}")

    ensure_baseline()

    baseline_app_dir = BASELINE_DIR / APP_DIR

    if not baseline_app_dir.exists():
        raise SystemExit(
            f"Baseline app backup not found at {baseline_app_dir}. "
            "Run revert if your backup is inconsistent, or delete .palette-baseline-backup and try again."
        )

    target_palette = PALETTES[option_name]
    changed_files = 0

    for baseline_file in get_app_files(baseline_app_dir):
        relative_path = baseline_file.relative_to(baseline_app_dir)
        target_file = APP_DIR / relative_path

        original = baseline_file.read_text()
        updated = original

        for current_color, role in CURRENT_PALETTE.items():
            replacement_color = target_palette.get(role)

            if replacement_color is None:
                raise SystemExit(
                    f"Palette '{option_name}' is missing role '{role}'."
                )

            updated = updated.replace(current_color, replacement_color)

        target_file.parent.mkdir(parents=True, exist_ok=True)
        target_file.write_text(updated)

        if updated != original:
            changed_files += 1

    print(f"Applied {option_name} palette to {changed_files} file(s).")
    print(f"Baseline backup is stored in: {BASELINE_DIR}")
    print("Preview with: npm run dev")


def revert_palette():
    if not BASELINE_DIR.exists():
        raise SystemExit("No baseline backup found. Nothing to revert.")

    baseline_app_dir = BASELINE_DIR / APP_DIR

    if not baseline_app_dir.exists():
        raise SystemExit(f"Baseline app backup not found at {baseline_app_dir}.")

    restored_files = copy_tree_files(baseline_app_dir, APP_DIR)

    print(f"Restored {restored_files} file(s) from baseline backup.")


def list_palettes():
    print("Available palettes:")
    print("  option1  Clean scientific / journal style")
    print("  option2  Marine biological / Okinawa-adjacent")
    print("  option3  Dark ink + leaf green")
    print("  option4  Academic blue / database style")
    print("  option5  Modern charcoal + amber")


def main():
    if len(sys.argv) == 2 and sys.argv[1] == "list":
        list_palettes()
        return

    if len(sys.argv) == 2 and sys.argv[1] == "revert":
        revert_palette()
        return

    if len(sys.argv) == 3 and sys.argv[1] == "apply":
        apply_palette(sys.argv[2])
        return

    raise SystemExit(
        "Usage:\n"
        "  python scripts/toggle_palette.py list\n"
        "  python scripts/toggle_palette.py apply option1\n"
        "  python scripts/toggle_palette.py apply option2\n"
        "  python scripts/toggle_palette.py apply option3\n"
        "  python scripts/toggle_palette.py apply option4\n"
        "  python scripts/toggle_palette.py apply option5\n"
        "  python scripts/toggle_palette.py revert"
    )


if __name__ == "__main__":
    main()
