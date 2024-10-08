from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework.response import Response
from upload.models import Content
from django.contrib.auth.models import Permission


class ContentSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    division_name = serializers.ReadOnlyField(source='division.name')
    created_by = serializers.ReadOnlyField(source='created_by.username')  

    class Meta:
        model = Content
        fields = ['id', 'title', 'description', 'start_time','department', 'department_name','division_name' ,'created_by']
        read_only_fields = ['created_by'] 