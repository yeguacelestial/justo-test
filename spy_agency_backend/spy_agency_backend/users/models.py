from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import (
    CharField,
    EmailField,
    ForeignKey,
    ManyToManyField,
    Model,
    TextChoices,
)
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from spy_agency_backend.users.managers import UserManager


class Hit(Model):
    class States(TextChoices):
        UNNASIGNED = "U", "Unassigned"
        ASSIGNED = "A", "Assigned"
        FAILED = "F", "Failed"
        COMPLETED = "C", "Completed"

    assigned_hitman = ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="assigned_hitman",
        blank=True,
        null=True,
    )
    name = CharField(_("Name of User"), blank=True, max_length=255)
    description = CharField(_("Description"), max_length=255, default="")
    state = CharField(
        _("User type"), max_length=2, choices=States.choices, default=States.UNNASIGNED
    )
    created_by = ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="created_by",
        blank=True,
        null=True,
    )


class User(AbstractUser):
    """
    Default custom user model for Spy Agency Backend.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    class Types(TextChoices):
        HITMAN = "H", "Hitman"
        MANAGER = "M", "Manager"
        BIG_BOSS = "BB", "Big Boss"

    # First and last name do not cover name patterns around the globe
    name = CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore
    last_name = None  # type: ignore
    email = EmailField(_("email address"), unique=True)
    username = None  # type: ignore

    # custom fields
    _type = CharField(
        _("User type"), max_length=2, choices=Types.choices, default=Types.HITMAN
    )
    assigned_hits = ManyToManyField(Hit, blank=True)
    description = CharField(_("Description"), max_length=255, default="")
    in_charge_of = ManyToManyField("self", symmetrical=False, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"pk": self.id})
