# backend/myapp/views.py
from django.http import JsonResponse
import torch
from chatbot_model.model import ChatbotModel

model = ChatbotModel(vocab_size=10000, embedding_dim=256, lstm_units=256)
#model.load_state_dict(torch.load('chatbot_model.pth'))
model.eval()

def chatbot_message(request):
    if request.method == 'POST':
        message = request.POST.get('message')
        # Process the message and generate a response using the model
        response = {"reply": "This is a response from the chatbot."}
        return JsonResponse(response)
    return JsonResponse({"error": "Invalid request"}, status=400)
