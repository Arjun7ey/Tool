import torch
import pandas as pd
from torch.utils.data import DataLoader, Dataset
from model import ChatbotModel
import numpy as np
import torch.nn as nn

class ChatbotDataset(Dataset):
    def __init__(self, data):
        self.inputs = data['input_text'].values
        self.responses = data['response_text'].values
    
    def __len__(self):
        return len(self.inputs)
    
    def __getitem__(self, idx):
        input_text = self.inputs[idx]
        response_text = self.responses[idx]
        # Convert text to tensor here (you need to implement this conversion)
        # For simplicity, assuming the conversion is done and returned as tensors
        encoder_input_data = torch.tensor(self.text_to_tensor(input_text), dtype=torch.long)
        decoder_target_data = torch.tensor(self.text_to_tensor(response_text), dtype=torch.long)
        return encoder_input_data, decoder_target_data
    
    def text_to_tensor(self, text):
        # Implement this function to convert text to a tensor representation
        # For example, you could use tokenization and convert tokens to indices
        pass

def train_model():
    # Prepare data
    data = pd.read_csv('chat_data.csv')
    dataset = ChatbotDataset(data)
    dataloader = DataLoader(dataset, batch_size=64, shuffle=True)
    
    # Initialize model, criterion, optimizer
    model = ChatbotModel(vocab_size=10000, embedding_dim=256, lstm_units=256)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    # Training loop
    for epoch in range(10):
        for batch in dataloader:
            encoder_input_data, decoder_target_data = batch
            optimizer.zero_grad()
            outputs = model(encoder_input_data)
            loss = criterion(outputs.view(-1, 10000), decoder_target_data.view(-1))
            loss.backward()
            optimizer.step()
    
    # Save the model
    torch.save(model.state_dict(), 'chatbot_model.pth')

if __name__ == "__main__":
    train_model()
