from typing import Any
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import (
    ListModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    CreateModelMixin,
)
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .serializers import UserSerializer, HitSerializer

from spy_agency_backend.users.models import Hit

User = get_user_model()


class UserViewSet(
    RetrieveModelMixin,
    ListModelMixin,
    UpdateModelMixin,
    CreateModelMixin,
    GenericViewSet,
):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = "pk"

    def get_queryset(self, *args, **kwargs):
        assert isinstance(self.request.user.id, int)
        return self.queryset.filter(id=self.request.user.id)

    @action(detail=False)
    def me(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(email=request.user)
        user_type = user._type

        match user_type:
            case User.Types.HITMAN:
                return Response({"error": "Unreachable for hitmen."})

            case User.Types.MANAGER:
                queryset = self.filter_queryset(
                    self.get_queryset().filter(id__in=user.in_charge_of)
                )
                serializer = self.get_serializer(queryset, many=True)

            case User.Types.BIG_BOSS:
                serializer = self.get_serializer(queryset, many=True)

            case _:
                return Response({"error": "You are not part of the spy agency."})

        return Response(serializer.data)

    def retrieve(self, request: Request, pk, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(email=request.user)
        user_type = user._type

        match user_type:
            case User.Types.HITMAN:
                return Response({"error": "Unreachable for hitmen."})

            case User.Types.MANAGER:
                queryset = self.filter_queryset(self.get_queryset().filter(id=pk))
                hitman = queryset.first()

                if hitman.id not in user.in_charge_of:
                    return Response({"error": "You are not in charge of this hitman."})
                serializer = self.get_serializer(hitman)

            case User.Types.BIG_BOSS:
                queryset = self.filter_queryset(
                    self.get_queryset().filter(id=pk)
                ).first()
                serializer = self.get_serializer(queryset)

            case _:
                return Response({"error": "You are not part of the spy agency."})

        return Response(serializer.data)

    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(email=request.user)
        user_type = user._type

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid(raise_exception=True):
            match user_type:
                case User.Types.HITMAN:
                    serializer.validated_data.pop("in_charge_of")

                case User.Types.MANAGER:
                    serializer.validated_data.pop("in_charge_of")

                case User.Types.BIG_BOSS:
                    pass
                case _:
                    return Response({"error": "You are not part of the spy agency."})

        serializer.save()
        return Response(serializer.data)


class HitViewSet(
    RetrieveModelMixin,
    ListModelMixin,
    UpdateModelMixin,
    CreateModelMixin,
    GenericViewSet,
):
    serializer_class = HitSerializer
    queryset = Hit.objects.all()

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(email=request.user)
        user_type = user._type

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        match user_type:
            case User.Types.HITMAN:
                return Response(
                    {
                        "error": "Dear hitman: you can't create a new hit. Maybe ask your manager?"
                    }
                )

            case User.Types.MANAGER:
                pass

            case User.Types.BIG_BOSS:
                pass

            case _:
                return Response(
                    {"error": "You are not a hitman, manager nor big boss."}
                )

        assigned_hitman = serializer.validated_data.get("assigned_hitman")
        assigned_hitman_filter = User.objects.filter(id=assigned_hitman)

        if assigned_hitman_filter.exists():
            assigned_hitman_user = assigned_hitman_filter.first()

            if assigned_hitman_user.id == user.id:
                return Response({"error": "You can't assign the hit to yourself."})

            if assigned_hitman_user.is_active:
                pass
            else:
                serializer.validated_data.pop("assigned_hitman")

        serializer.validated_data["created_by"] = user
        serializer.save()

        return super().create(request, *args, **kwargs)

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(email=request.user)
        user_type = user._type

        match user_type:
            case User.Types.HITMAN:
                queryset = self.filter_queryset(
                    self.get_queryset().filter(assigned_hitman=user)
                )
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data)

            case User.Types.MANAGER:
                queryset = self.filter_queryset(
                    self.get_queryset().filter(assigned_hitman__in=user.in_charge_of)
                )
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data)

            case User.Types.BIG_BOSS:
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data)

        return super().list(request, *args, **kwargs)

    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(email=request.user)
        user_type = user._type

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid(raise_exception=True):
            match user_type:
                case User.Types.HITMAN:
                    serializer.validated_data.pop("assigned_hitman")
                    serializer.validated_data.pop("name")
                    serializer.validated_data.pop("description")
                    serializer.validated_data.pop("created_by")

                case User.Types.MANAGER:
                    serializer.validated_data.pop("name")
                    serializer.validated_data.pop("description")
                    serializer.validated_data.pop("created_by")

                    assigned_hitman = serializer.validated_data.get(
                        "assigned_hitman", False
                    )
                    assigned_hitman_filter = User.objects.filter(id=assigned_hitman)

                    if assigned_hitman_filter.exists():
                        assigned_hitman_user = assigned_hitman_filter.first()

                        if assigned_hitman_user.is_active:
                            pass
                        else:
                            serializer.validated_data.pop("assigned_hitman")

                case User.Types.BIG_BOSS:
                    serializer.validated_data.pop("name")
                    serializer.validated_data.pop("description")
                    serializer.validated_data.pop("created_by")

                    assigned_hitman = serializer.validated_data.get(
                        "assigned_hitman", False
                    )
                    assigned_hitman_filter = User.objects.filter(id=assigned_hitman)

                    if assigned_hitman_filter.exists():
                        assigned_hitman_user = assigned_hitman_filter.first()

                        if assigned_hitman_user.is_active:
                            pass
                        else:
                            serializer.validated_data.pop("assigned_hitman")

                case _:
                    serializer.validated_data.pop("assigned_hitman")
                    serializer.validated_data.pop("name")
                    serializer.validated_data.pop("description")
                    serializer.validated_data.pop("created_by")
                    serializer.validated_data.pop("status")

            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["patch"])
    def bulk_update(self, request):
        hits = request.data.get("hits", [])
        serializer = self.get_serializer(data=hits, many=True)
        serializer.is_valid(raise_exception=True)
        updated_hits = serializer.save()

        return Response({"updated_hits": serializer.data})
