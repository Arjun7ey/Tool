# Generated by Django 5.0.7 on 2024-08-20 17:34

import django.db.models.deletion
import upload.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('upload', '0008_document_status_change_date_post_status_change_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('video', models.FileField(blank=True, null=True, upload_to=upload.models.Video.nameFile)),
                ('status', models.CharField(default='Pending', max_length=15)),
                ('rating', models.IntegerField(default=2)),
                ('dated', models.DateField(auto_now_add=True)),
                ('status_change_date', models.DateField(blank=True, null=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='upload.category')),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='upload.department')),
                ('tags', models.ManyToManyField(blank=True, to='upload.tag')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
