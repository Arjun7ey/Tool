from rest_framework import serializers

from django.contrib.auth import authenticate
from rest_framework.response import Response
from upload.models import Message
from django.contrib.auth.models import Permission

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['sender', 'content', 'timestamp']