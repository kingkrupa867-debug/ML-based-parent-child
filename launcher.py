"""
launcher.py — Desktop entry point for CommQuality Analyzer (PyWebView + Django)

HOW IT WORKS:
  1. Starts Django on 127.0.0.1:8000 in a background thread (hidden from user)
  2. Opens a native desktop window (no browser address bar visible)
  3. The window loads the React SPA built and served by Django

Run locally:   python launcher.py
Build for Windows: see build_desktop.bat
"""

import os
import sys
import time
import socket
import threading
import subprocess
import webbrowser
import traceback

# ── Resolve BASE_DIR whether running as .py or PyInstaller bundle ─────────
if getattr(sys, 'frozen', False):
    # Running as a PyInstaller executable
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DJANGO_PORT  = 8000
DJANGO_HOST  = '127.0.0.1'
APP_URL      = f'http://{DJANGO_HOST}:{DJANGO_PORT}'

# Random cache-buster so WebKit2 disk cache never serves stale pages
import random as _random
_cache_bust = _random.randint(100000, 999999)
SPLASH_URL   = f'{APP_URL}/splash/?_={_cache_bust}'

# ── Log file for debugging crashes ───────────────────────────────────────
LOG_FILE = os.path.join(os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else __file__), 'commquality.log')

import datetime

def log(msg: str, level: str = 'INFO') -> None:
    """Write timestamped message to both stdout and a log file."""
    ts = datetime.datetime.now().strftime('%H:%M:%S')
    line = f'[{ts}] [{level}] {msg}'
    print(line)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(line + '\n')
    except Exception:
        pass

# ── Django env setup ──────────────────────────────────────────────────────
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'communication_analyzer.settings')
os.environ['DESKTOP_MODE'] = 'true'

# Add BASE_DIR to sys.path so Django can find its modules when frozen
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def _is_port_open(host: str, port: int) -> bool:
    """Return True if something is already listening on host:port."""
    try:
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except OSError:
        return False


def start_django() -> None:
    """
    Start the Django development server.
    - When frozen (PyInstaller .exe): uses wsgiref directly,
      because sys.executable is the .exe — not Python — so subprocess won't work.
    - When running as .py script: uses subprocess (normal dev mode).
    """
    if getattr(sys, 'frozen', False):
        # ── Frozen mode: serve Django directly with wsgiref ──────────────────
        try:
            log('[launcher] Frozen mode: starting Django via wsgiref WSGI server')

            # Redirect stdout/stderr to log file — they are None in --windowed mode.
            _log_handle = open(LOG_FILE, 'a', encoding='utf-8')
            if sys.stdout is None:
                sys.stdout = _log_handle
            if sys.stderr is None:
                sys.stderr = _log_handle

            # Set working directory so Django finds db.sqlite3, etc.
            os.chdir(BASE_DIR)

            # Boot Django
            import django
            django.setup()
            log('[launcher] Django setup() complete')

            # Import WSGI application
            from communication_analyzer.wsgi import application
            log('[launcher] WSGI application imported')

            # Serve with wsgiref (single-threaded, desktop-only)
            from wsgiref.simple_server import WSGIServer, WSGIRequestHandler

            class _SilentHandler(WSGIRequestHandler):
                """Suppress noisy per-request log lines."""
                def log_message(self, fmt, *args):
                    pass

            server = WSGIServer((DJANGO_HOST, DJANGO_PORT), _SilentHandler)
            server.set_app(application)
            log(f'[launcher] wsgiref listening on {DJANGO_HOST}:{DJANGO_PORT}')
            server.serve_forever()

        except Exception as e:
            log(f'[launcher] Django crashed: {e}')
            log(f'[launcher] Traceback:\n{traceback.format_exc()}')
    else:
        # ── Script mode: use venv python if available ────────────────────────
        # Check for a local venv first (works cross-platform)
        if sys.platform == 'win32':
            venv_python = os.path.join(BASE_DIR, 'venv', 'Scripts', 'python.exe')
        else:
            venv_python = os.path.join(BASE_DIR, 'venv', 'bin', 'python')
        python = venv_python if os.path.exists(venv_python) else sys.executable
        manage = os.path.join(BASE_DIR, 'manage.py')
        log(f'Using Python: {python}')
        log(f'Script mode: starting Django via subprocess: {manage}')
        try:
            subprocess.Popen(
                [
                    python, manage, 'runserver',
                    f'{DJANGO_HOST}:{DJANGO_PORT}',
                    '--noreload',
                    '--nothreading',
                ],
                cwd=BASE_DIR,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0,
            )
        except Exception as e:
            log(f'Failed to start Django subprocess: {e}', 'ERROR')


def wait_for_django(timeout: int = 60) -> bool:
    """
    Poll until Django is accepting connections, or timeout is reached.
    Returns True if Django started successfully.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        if _is_port_open(DJANGO_HOST, DJANGO_PORT):
            return True
        time.sleep(0.3)
    return False


def show_error(title: str, message: str) -> None:
    """Show a native error dialog on Windows, or print on other platforms."""
    if sys.platform == 'win32':
        try:
            import ctypes
            ctypes.windll.user32.MessageBoxW(0, message, title, 0x10)
        except Exception:
            print(f'[ERROR] {title}: {message}')
    else:
        print(f'[ERROR] {title}: {message}')


def open_window() -> None:
    """Open the app in a native PyWebView window (cross-platform)."""
    try:
        import webview  # type: ignore

        window = webview.create_window(
            title='CommQuality — Parent-Child Communication Analyzer',
            url=SPLASH_URL,
            width=1280,
            height=800,
            resizable=True,
            min_size=(960, 640),
            text_select=True,
        )

        def on_loaded():
            log(f'[launcher] Page loaded: {window.get_current_url()}')
        window.events.loaded += on_loaded

        if sys.platform == 'linux':
            # Clear WebKit2 disk cache so pages always load fresh
            import shutil
            cache_dirs = [
                os.path.expanduser('~/.local/share/webview'),
                os.path.expanduser('~/.cache/webview'),
            ]
            for d in cache_dirs:
                if os.path.isdir(d):
                    try:
                        shutil.rmtree(d)
                        log(f'[launcher] Cleared WebKit2 cache: {d}')
                    except Exception as e:
                        log(f'[launcher] Could not clear cache {d}: {e}')

            try:
                import gi
                gi.require_version('WebKit2', '4.1')
                from gi.repository import WebKit2
                webkit_settings = WebKit2.Settings()
                webkit_settings.set_enable_developer_extras(False)
                webkit_settings.set_enable_page_cache(False)
                webkit_settings.set_enable_html5_local_storage(True)
                webkit_settings.set_enable_html5_database(True)
                log('[launcher] WebKit2 localStorage enabled ✓')
            except Exception as e:
                log(f'[launcher] WebKit2 config skipped: {e}')
            webview.start(gui='gtk', debug=False)

        elif sys.platform == 'win32':
            webview.start(debug=False)

        else:
            webview.start(debug=False)

    except ImportError:
        log('[launcher] pywebview not found — opening in browser instead.')
        webbrowser.open(APP_URL)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


def main() -> None:
    log('[launcher] ══════════════════════════════════════')
    log(f'[launcher] CommQuality Analyzer starting up')
    log(f'[launcher] BASE_DIR = {BASE_DIR}')
    log(f'[launcher] frozen   = {getattr(sys, "frozen", False)}')
    log('[launcher] ══════════════════════════════════════')

    # ── 1. Start Django in a daemon thread ───────────────────────────────
    log('[launcher] Starting Django backend …')
    django_thread = threading.Thread(target=start_django, daemon=True)
    django_thread.start()

    # ── 2. Wait until Django is ready ────────────────────────────────────
    log('[launcher] Waiting for Django to be ready …')
    ready = wait_for_django(timeout=60)
    if not ready:
        msg = (
            f'Django did not start within 60 seconds.\n\n'
            f'Check the log file for details:\n{LOG_FILE}'
        )
        log(f'[launcher] ERROR: {msg}')
        show_error('CommQuality — Startup Error', msg)
        sys.exit(1)

    log(f'[launcher] Django ready at {APP_URL}')

    # ── 3. Open the native desktop window ────────────────────────────────
    open_window()


if __name__ == '__main__':
    main()
