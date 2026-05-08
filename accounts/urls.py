from django.urls import path
from . import views

urlpatterns = [
    # HTML pages
    path('register/', views.register_page, name='register'),
    path('login/', views.login_page, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('parent-code/', views.parent_code_page, name='parent_code'),
    path('connect-child/', views.connect_child_page, name='connect_child'),

    # REST API
    path('api/csrf/', views.api_csrf, name='api_csrf'),
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/user/',          views.api_user,                name='api_user'),
    path('api/my-invite-code/',     views.api_my_invite_code,       name='api_my_invite_code'),
    path('api/verify-session-code/', views.api_verify_session_code,  name='api_verify_session_code'),
]
