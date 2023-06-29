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

from .serializers import UserSerializer, HitSerializer, CreateUserSerializer

from spy_agency_backend.users.models import Hit

User = get_user_model()


class UserViewSet(
    RetrieveModelMixin,
    ListModelMixin,
    UpdateModelMixin,
    CreateModelMixin,
    GenericViewSet,
):
    queryset = User.objects.all()
    lookup_field = "pk"

    def get_serializer_class(self):
        if self.action == "create":
            return CreateUserSerializer
        return UserSerializer

    def get_queryset(self, *args, **kwargs):
        assert isinstance(self.request.user.id, int)
        return self.queryset.filter(id=self.request.user.id)

    @action(detail=False)
    def me(self, request):
        user = User.objects.get(email=request.user)
        serializer = self.get_serializer(user, many=False)
        return Response(status=status.HTTP_200_OK, data=serializer.data)

    @action(detail=False)
    def active(self, request):
        user = User.objects.get(email=request.user)
        user_type = user._type

        match user_type:
            case User.Types.HITMAN:
                return Response({"error": "you can't do that!"})

            case User.Types.MANAGER:
                serializer = self.get_serializer(
                    self.queryset.exclude(id__in=[1, user.id]).filter(
                        id__in=user.in_charge_of, is_active=True
                    ),
                    many=True,
                )

            case User.Types.BIG_BOSS:
                serializer = self.get_serializer(
                    self.queryset.exclude(id=user.id).filter(is_active=True),
                    many=True,
                )

            case _:
                return Response({"error": "You are not part of the spy agency."})

        return Response(serializer.data)

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(email=request.user)
        user_type = user._type

        match user_type:
            case User.Types.HITMAN:
                return Response({"error": "you can't do that!"})

            case User.Types.MANAGER:
                serializer = self.get_serializer(
                    self.queryset.exclude(id__in=[1, user.id]).filter(
                        id__in=user.in_charge_of
                    ),
                    many=True,
                )

            case User.Types.BIG_BOSS:
                serializer = self.get_serializer(
                    self.queryset.exclude(id=user.id),
                    many=True,
                )

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
        try:
            user = User.objects.get(email=request.user)
            user_type = user._type

        except User.DoesNotExist:
            return Response({"error": "request user does not exist"})

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

        hit_name = serializer.validated_data.get("name")
        if self.queryset.filter(name=hit_name).exists():
            return Response(
                data={"error": "a hit with that name already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assigned_hitman = serializer.validated_data.get("assigned_hitman")
        assigned_hitman_filter = User.objects.filter(id=assigned_hitman.id)

        if assigned_hitman_filter.exists():
            assigned_hitman_user = assigned_hitman_filter.first()

            if assigned_hitman_user.is_active == False:
                return Response(
                    data={"error": "hitman was excommunicado (not active anymore)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if assigned_hitman_user.id == user.id:
                return Response(
                    data={"error": "You can't assign the hit to yourself."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if assigned_hitman_user.is_active == False:
                return Response(
                    data={"error": "assigned hitman is inactive"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        else:
            return Response(
                data={"error": "assigned hitman does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.validated_data["created_by"] = user
        serializer.validated_data["state"] = Hit.States.ASSIGNED
        serializer.save()

        return Response(serializer.data)

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(email=request.user)
        user_type = user._type

        try:
            match user_type:
                case User.Types.HITMAN:
                    queryset = Hit.objects.filter(assigned_hitman=user.id)
                    serializer = self.get_serializer(queryset, many=True)
                    return Response(serializer.data)

                case User.Types.MANAGER:
                    queryset = Hit.objects.filter(assigned_hitman__in=user.in_charge_of)
                    serializer = self.get_serializer(queryset, many=True)
                    return Response(serializer.data)

                case User.Types.BIG_BOSS:
                    serializer = self.get_serializer(
                        Hit.objects.all().order_by("id").reverse(), many=True
                    )
                    return Response(serializer.data)

                case _:
                    return Response(
                        data={"error": "who are you?"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        except User.DoesNotExist:
            return Response(
                data={"error": "something went wrong"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
