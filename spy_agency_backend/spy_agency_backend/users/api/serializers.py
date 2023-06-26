from typing import Any
from django.contrib.auth import get_user_model
from rest_framework import serializers

from spy_agency_backend.users.models import Hit

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    _type = serializers.ChoiceField(choices=User.Types.choices)
    description = serializers.CharField()

    class Meta:
        model = User
        fields = [
            "name",
            "is_active",
            "email",
            "password",
            "_type",
            "description",
            "in_charge_of",
        ]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "pk"},
        }


class HitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hit
        fields = ["assigned_hitman", "name", "description", "state", "created_by"]
