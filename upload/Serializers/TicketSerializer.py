from rest_framework import serializers
from upload.models import Ticket, TicketUpdate
from upload.models import User

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name()

class TicketUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TicketUpdate
        fields = ['id', 'ticket', 'user', 'content', 'created_at', 'attachment']
        read_only_fields = ['user', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    updates = TicketUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'created_by', 'assigned_to', 
            'created_at', 'updated_at', 'priority', 'status', 'source', 
            'due_date', 'is_social_media_ticket', 'social_media_platform',
            'social_media_post_id', 'social_media_post_url', 'attachment',
            'updates'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        ticket = Ticket.objects.create(created_by=user, **validated_data)
        return ticket

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class TicketUpdateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketUpdate
        fields = ['ticket', 'content', 'attachment']

    def create(self, validated_data):
        user = self.context['request'].user
        return TicketUpdate.objects.create(user=user, **validated_data)