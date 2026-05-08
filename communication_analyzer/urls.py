"""
communication_analyzer URL Configuration — Desktop-aware version

In desktop mode (served by Django):
  /          → serves React index.html  (SPA handles all frontend routes)
  /splash/   → standalone splash screen (not React — WebKit2 compatibility)
  /api/      → REST endpoints (via accounts + questionnaire)
  /admin/    → Django admin
  /static/   → JS/CSS assets from the React build
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import redirect
from django.views.generic import TemplateView
from django.views.static import serve as static_serve
from django.template.response import TemplateResponse
import os
from django.conf import settings


def _splash(request):
    """Serve the desktop splash screen (standalone HTML — not React).
    pywebview's WebKit2 cannot re-render React after navigating from a
    React page, so the splash must be a standalone HTML page."""
    response = TemplateResponse(request, 'splash.html')
    response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    return response


def _splash_log(request):
    """Receive JS console/error messages from the pywebview window."""
    import logging
    msg = request.GET.get('msg', '')
    logging.getLogger('splash').warning('[WEBVIEW] %s', msg)
    print(f'[WEBVIEW] {msg}')
    from django.http import HttpResponse
    return HttpResponse('ok')


# ── SPA view — serves React index.html as-is (no script modification) ────
spa_view = TemplateView.as_view(template_name='index.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('splash/', _splash, name='splash'),
    path('splash-log/', _splash_log, name='splash_log'),
    path('go/', lambda r: __import__('django.http', fromlist=['HttpResponse']).HttpResponse('ok'), name='go'),
    path('', include('accounts.urls')),
    path('', include('questionnaire.urls')),
]

# ── Serve root-level public files from React build (images, SVGs, etc.) ──
REACT_BUILD_DIR = getattr(settings, 'REACT_BUILD_DIR', None)
if REACT_BUILD_DIR and REACT_BUILD_DIR.exists():
    urlpatterns += [
        re_path(
            r'^(?P<path>.*\.(png|svg|ico|jpg|jpeg|gif|webp|json|txt))$',
            static_serve,
            {'document_root': str(REACT_BUILD_DIR)},
        ),
    ]

# Catch-all: serve React index.html for all client-side routes
urlpatterns += [
    re_path(r'^(?!api/|admin/|splash/|static/).*$', spa_view, name='react_catchall'),
]
