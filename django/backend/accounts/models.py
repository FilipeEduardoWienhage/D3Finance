from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class UserProfile(AbstractUser):
    email_confirmed = models.BooleanField(default=False)  # marca se o email foi confirmado
    confirmation_token = models.CharField(max_length=64, null=True, blank=True)  #token confirmacao

    groups = models.ManyToManyField(Group, related_name='user_profiles', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='user_profiles', blank=True)

    def __str__(self):
        return self.username

# Create your models here.
