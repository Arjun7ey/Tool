# Generated by Django 5.1 on 2024-08-26 15:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('upload', '0020_alter_user_divisions_alter_user_subdivisions'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(choices=[('superadmin', 'Super Admin'), ('departmentadmin', 'Department Admin'), ('divisionadmin', 'Division Admin'), ('subdivisionuser', 'SubDivision User'), ('user', 'User'), ('readonlyuser', 'Read Only User')], default='user', max_length=20),
        ),
    ]
