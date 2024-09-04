from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from upload.models import User 
import logging

logger = logging.getLogger('upload')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
        
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
      
        token['username'] = user.username
        return token

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        print("Received request data:", attrs)
        
        # Attempt to get the email or username from the request
        username_or_email = attrs.get('username') or attrs.get('email')
        password = attrs.get('password')

        if not username_or_email or not password:
            print("Username/email or password is missing.")
            raise serializers.ValidationError('Username or email and password are required.')

        user = None
        # Check if the username_or_email is an email address or a username
        if '@' in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
                if not user.check_password(password):
                    print("Password mismatch for email:", username_or_email)
                    raise serializers.ValidationError('Invalid credentials')
            except User.DoesNotExist:
                print("No user found with email:", username_or_email)
                raise serializers.ValidationError('Invalid credentials')
        else:
            user = authenticate(username=username_or_email, password=password)
            if user is None:
                print("Authentication failed for username:", username_or_email)
                raise serializers.ValidationError('Invalid credentials')

        # Generate token if user is found
        token = self.get_token(user)
        print("Generated tokens for user:", user.username)
        return {
            'refresh': str(token),
            'access': str(token.access_token),
        }