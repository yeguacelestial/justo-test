# Generated by Django 4.1.9 on 2023-06-28 22:03

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0003_hit_assigned_hitman_hit_created_by_hit_description_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="hit",
            name="state",
            field=models.CharField(
                choices=[("U", "Unassigned"), ("A", "Assigned"), ("F", "Failed"), ("C", "Completed")],
                default="U",
                max_length=2,
                verbose_name="Hit Status",
            ),
        ),
    ]
