import secrets
import string

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('parent', 'Parent'),
        ('child', 'Child'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='parent')
    email = models.EmailField(unique=True)
    surname = models.CharField(max_length=100)
    family_id = models.CharField(max_length=120, db_index=True, editable=False)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')
    invite_code = models.CharField(max_length=12, unique=True, blank=True, null=True, editable=False)

    def _generate_invite_code(self):
        alphabet = string.ascii_uppercase + string.digits
        for _ in range(10):
            code = ''.join(secrets.choice(alphabet) for _ in range(8))
            if not CustomUser.objects.filter(invite_code=code).exists():
                return code
        return secrets.token_urlsafe(8).upper()

    def save(self, *args, **kwargs):
        if self.role == 'parent' and not self.invite_code:
            self.invite_code = self._generate_invite_code()
        if self.role != 'parent':
            self.invite_code = None

        self.family_id = slugify(self.surname).replace('-', '') or self.surname.lower().strip()
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.role})"
