from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from spy_agency_backend.users.forms import UserAdminChangeForm, UserAdminCreationForm

from spy_agency_backend.users.models import Hit

User = get_user_model()


@admin.register(User)
class UserAdmin(auth_admin.UserAdmin):
    form = UserAdminChangeForm
    add_form = UserAdminCreationForm
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("name",)}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
        (
            _("Custom Fields"),
            {"fields": ("_type", "assigned_hits", "description", "in_charge_of")},
        ),
    )
    list_display = ["email", "name", "is_superuser"]
    search_fields = ["name"]
    ordering = ["id"]
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )


@admin.register(Hit)
class HitAdmin(admin.ModelAdmin):
    list_display = ("name", "assigned_hitman", "state", "created_by")
    list_filter = ("state", "created_by")
    search_fields = ("name", "assigned_hitman__username", "created_by__username")
    readonly_fields = ("created_by",)

    fieldsets = (
        (None, {"fields": ("name", "description")}),
        ("Status", {"fields": ("state",)}),
        ("Assignments", {"fields": ("assigned_hitman", "created_by")}),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            # Set the created_by field when creating a new hit
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
