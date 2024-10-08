# backend/chatbot_model/model.py
import torch
import torch.nn as nn

class ChatbotModel(nn.Module):
    def __init__(self, vocab_size, embedding_dim, lstm_units):
        super(ChatbotModel, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, lstm_units, batch_first=True)
        self.fc = nn.Linear(lstm_units, vocab_size)
    
    def forward(self, x):
        x = self.embedding(x)
        h, _ = self.lstm(x)
        x = self.fc(h)
        return x
