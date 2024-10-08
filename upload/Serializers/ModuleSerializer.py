# serializers.py
from rest_framework import serializers
from upload.models import Module, EmailDomainPermission

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'name']

class EmailDomainPermissionSerializer(serializers.ModelSerializer):
    allowed_modules = ModuleSerializer(many=True)

    class Meta:
        model = EmailDomainPermission
        fields = ['domain', 'allowed_modules']
