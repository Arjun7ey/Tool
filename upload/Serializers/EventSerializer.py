from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from upload.models import Event 

class EventSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    division_name = serializers.ReadOnlyField(source='division.name')
    created_by = serializers.ReadOnlyField(source='created_by.username')  

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'department', 'division_name','department_name', 'created_by']
        read_only_fields = ['created_by'] 