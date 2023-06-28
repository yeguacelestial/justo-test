from typing import Any
from django.contrib.auth import get_user_model
from rest_framework import serializers

from spy_agency_backend.users.models import Hit

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    _type = serializers.ChoiceField(
        choices=User.Types.choices, source="get__type_display"
    )
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

    def get_fields(self):
        fields = super().get_fields()

        if self.context["view"].action == "create":
            # Include confirm_password field only in the create action
            fields["confirm_password"] = serializers.CharField(write_only=True)

        return fields

    def get__type(self, obj):
        return obj.get__type_display()


class CreateUserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["name", "email", "password", "confirm_password"]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        # Validate the confirm_password field
        confirm_password = validated_data.pop("confirm_password")
        if confirm_password != validated_data.get("password"):
            raise serializers.ValidationError("Passwords do not match.")

        user = super().create(validated_data)
        user.set_password(validated_data["password"])
        user.save()

        return user


class HitSerializer(serializers.ModelSerializer):
    state = serializers.ChoiceField(
        choices=Hit.States.choices, source="get_state_display"
    )

    class Meta:
        model = Hit
        fields = ["id", "assigned_hitman", "name", "description", "state", "created_by"]

    def get_state(self, obj):
        return obj.get__state_display()

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response["assigned_hitman"] = instance.assigned_hitman.name
        response["created_by"] = instance.created_by.name

        return response
