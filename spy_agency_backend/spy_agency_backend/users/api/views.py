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


class HitViewSet(
    RetrieveModelMixin,
    ListModelMixin,
    UpdateModelMixin,
    CreateModelMixin,
    GenericViewSet,
):
    serializer_class = HitSerializer
    queryset = Hit.objects.all()

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user = User.objects.get(id=request.user)
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

    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=["patch"])
    def bulk_update(self, request):
        hits = request.data.get("hits", [])
        serializer = self.get_serializer(data=hits, many=True)
        serializer.is_valid(raise_exception=True)
        updated_hits = serializer.save()

        return Response({"updated_hits": serializer.data})
