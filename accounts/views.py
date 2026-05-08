from django.contrib.auth import login, logout
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import UserRegistrationSerializer, UserLoginSerializer
from .models import CustomUser


# ── HTML VIEW ──────────────────────────────────────────────────────────────
def register_page(request):
    """Render registration page & handle form POST."""
    if request.user.is_authenticated:
        return redirect('questionnaire')

    if request.method == 'POST':
        serializer = UserRegistrationSerializer(data=request.POST)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            messages.success(request, f"Welcome, {user.username}! Account created.")
            return redirect('questionnaire')
        else:
            for field, errs in serializer.errors.items():
                for err in errs:
                    messages.error(request, f"{field}: {err}")

    return render(request, 'accounts/register.html')


def login_page(request):
    """Render login page & handle form POST."""
    if request.user.is_authenticated:
        return redirect('questionnaire')

    if request.method == 'POST':
        serializer = UserLoginSerializer(data=request.POST)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            if user.role == 'child' and not user.parent:
                return redirect('connect_child')
            return redirect('questionnaire')
        else:
            messages.error(request, "Invalid username or password.")

    return render(request, 'accounts/login.html')


def logout_view(request):
    """Log out and redirect to login."""
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('login')


@login_required
def parent_code_page(request):
    if request.user.role != 'parent':
        messages.error(request, "Only parents can view a family invite code.")
        return redirect('questionnaire')

    if not request.user.invite_code:
        request.user.save(update_fields=['invite_code'])

    return render(request, 'accounts/parent_code.html', {
        'invite_code': request.user.invite_code,
    })


@login_required
def connect_child_page(request):
    if request.user.role != 'child':
        messages.error(request, "Only child accounts can connect to a parent.")
        return redirect('questionnaire')

    if request.user.parent:
        messages.info(request, "Your child account is already linked to a parent.")
        return redirect('questionnaire')

    if request.method == 'POST':
        invite_code = request.POST.get('invite_code', '').strip().upper()
        if not invite_code:
            messages.error(request, "Please enter the parent code.")
        else:
            try:
                parent = CustomUser.objects.get(invite_code=invite_code, role='parent')
                request.user.parent = parent
                request.user.save(update_fields=['parent'])
                messages.success(request, f"Connected with parent account {parent.username}.")
                return redirect('questionnaire')
            except CustomUser.DoesNotExist:
                messages.error(request, "Parent code not found. Please check and try again.")

    return render(request, 'accounts/connect_child.html')


# ── REST API ────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def api_csrf(request):
    return Response({'detail': 'CSRF cookie set.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {
                'message': 'User registered successfully.',
                'role': user.role,
                'surname': user.surname,
                'family_id': user.family_id,
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        return Response({
            'message': 'Login successful.',
            'username': user.username,
            'role': user.role,
            'surname': user.surname,
            'family_id': user.family_id,
        })
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    logout(request)
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user(request):
    """Return the currently authenticated user's profile."""
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'surname': user.surname,
        'family_id': user.family_id,
        'invite_code': user.invite_code,
        'parent': user.parent.username if user.parent else None,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_my_invite_code(request):
    """
    Return a parent's invite code.
    - If authenticated via session → use request.user
    - Fallback: ?username=<username> query param (for cross-origin SPA dev)
    """
    # Try session auth first
    if request.user and request.user.is_authenticated:
        user = request.user
    else:
        # Fallback for cross-origin dev (React :3000 → Django :8000)
        username = request.query_params.get('username', '').strip()
        if not username:
            return Response({'error': 'Not authenticated. Please log in again.'},
                            status=status.HTTP_401_UNAUTHORIZED)
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if user.role != 'parent':
        return Response({'error': 'Only parent accounts have an invite code.'},
                        status=status.HTTP_403_FORBIDDEN)
    if not user.invite_code:
        user.save()
        user.refresh_from_db()
    return Response({'invite_code': user.invite_code})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_verify_session_code(request):
    """
    Child: verify a parent's invite code before the joint assessment.
    Body: { code: "ABCD1234" }
    Returns: { valid: true, parent_username: "...", family_id: "..." }
    """
    code = request.data.get('code', '').strip().upper()
    if not code:
        return Response({'error': 'Code is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        parent = CustomUser.objects.get(invite_code=code, role='parent')
    except CustomUser.DoesNotExist:
        return Response({'error': 'Invalid code. Please check with your parent.'},
                        status=status.HTTP_404_NOT_FOUND)

    # Optionally auto-link child → parent if not already linked
    child = request.user
    if child.role == 'child' and not child.parent:
        child.parent = parent
        child.save(update_fields=['parent'])

    return Response({
        'valid': True,
        'parent_username': parent.username,
        'family_id': parent.family_id,
    })
