from typing import Any
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    _type = serializers.ChoiceField(choices=User.Types.choices)
    description = serializers.CharField()

    class Meta:
        model = User
        fields = ["name", "url", "email", "password", "_type", "description"]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "pk"},
        }
