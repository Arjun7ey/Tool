# consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class DirectMessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'direct_{self.user_id}'

        # Join the user's personal group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the user's personal group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        recipient_id = text_data_json['recipient_id']
        message = text_data_json['message']

        # Send message to the recipient's personal group
        await self.channel_layer.group_send(
            f'direct_{recipient_id}',
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from the group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
