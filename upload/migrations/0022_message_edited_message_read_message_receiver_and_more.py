# Generated by Django 5.1 on 2024-08-27 13:08

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('upload', '0021_alter_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='edited',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='message',
            name='read',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='message',
            name='receiver',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='received_messages', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='message',
            name='sender',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to=settings.AUTH_USER_MODEL),
        ),
    ]
