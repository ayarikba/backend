# Generated by Django 3.2.11 on 2024-02-19 15:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_auto_20240219_1455'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='avatar_42',
            field=models.URLField(blank=True),
        ),
    ]
