from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from upload.models import Event 

class EventSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    created_by = serializers.ReadOnlyField(source='created_by.username')  

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'department', 'department_name', 'created_by']
        read_only_fields = ['created_by'] 