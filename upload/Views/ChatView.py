from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from upload.models import Conversation, Message, User
from django.db.models import Q
from upload.Serializers.ChatSerializer import ConversationSerializer
import json

class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id, *args, **kwargs):
        try:
            # Retrieve the conversation by ID
            conversation = get_object_or_404(Conversation, id=conversation_id)
            

            # Ensure the current user is part of the conversation
            user = request.user
            if not conversation.participants.filter(id=user.id).exists():
                
                return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

            # Retrieve all messages for this conversation, ordered by timestamp
            messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
            messages_data = messages.values('id', 'sender__username', 'content', 'timestamp')

         

            return Response(messages_data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f'Error retrieving messages: {e}')
            return Response({"error": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        recipient_id = data.get('recipient_id')
        message_content = data.get('message')

        if not recipient_id or not message_content:
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)

        current_user = request.user

        # Retrieve or create conversation
        conversations = Conversation.objects.filter(
            participants=current_user
        ).filter(
            participants=recipient
        ).distinct().first()

        if not conversations:
            # Create a new conversation if it doesn't exist
            conversation = Conversation.objects.create()
            conversation.participants.add(current_user, recipient)
        else:
            conversation = conversations

        Message.objects.create(
            conversation=conversation,
            sender=current_user,
            receiver=recipient,
            content=message_content
        )

        return Response({'status': 'Message sent'})

class MarkMessagesAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, recipient_id, *args, **kwargs):
        user = request.user
        User = get_user_model()

        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            return Response({"error": "Recipient not found"}, status=status.HTTP_404_NOT_FOUND)

        # Find the conversation between the current user and the recipient
        conversation = Conversation.objects.filter(
            participants=user
        ).filter(
            participants=recipient
        ).distinct().first()

        if not conversation:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        # Mark all unread messages as read
        Message.objects.filter(
            conversation=conversation,
            receiver=user,
            read=False
        ).update(read=True)

        return Response({'status': 'Messages marked as read'})

class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        unread_counts = {}

        # Count unread messages for each user
        conversations = Conversation.objects.filter(participants=user)
        for conversation in conversations:
            other_participant = conversation.participants.exclude(id=user.id).first()
            if other_participant:
                unread_count = Message.objects.filter(
                    conversation=conversation,
                    receiver=user,
                    read=False
                ).count()
                unread_counts[other_participant.id] = unread_count

        return Response(unread_counts)

class DeleteMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id, *args, **kwargs):
        message = get_object_or_404(Message, id=message_id)
        if message.sender != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        message.delete()
        return Response({'status': 'Message deleted'})

class CreateOrFetchConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        current_user = request.user
        other_user = get_object_or_404(User, id=user_id)

        # Find conversations where both users are participants
        conversations = Conversation.objects.filter(
            participants=current_user
        ).filter(
            participants=other_user
        )

        # Ensure to get distinct conversation
        if conversations.exists():
            conversation = conversations.first()
        else:
            # Create a new conversation if none exists
            conversation = Conversation.objects.create()
            conversation.participants.add(current_user, other_user)

        serializer = ConversationSerializer(conversation)
        
        return Response({'conversationId': serializer.data['id']}, status=status.HTTP_200_OK)