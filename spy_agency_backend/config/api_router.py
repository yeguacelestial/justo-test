from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

from spy_agency_backend.users.api.views import UserViewSet, HitViewSet

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

router.register("users", UserViewSet)
router.register("hits", HitViewSet)


app_name = "api"
urlpatterns = router.urls
