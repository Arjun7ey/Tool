import torch
import pandas as pd
from torch.utils.data import DataLoader, Dataset
from model import ChatbotModel
import torch.nn as nn

class ChatbotDataset(Dataset):
    def __init__(self, data):
        # Convert text to lists of strings
        self.inputs = data['input_text'].tolist()
        self.responses = data['response_text'].tolist()
    
    def __len__(self):
        return len(self.inputs)
    
    def __getitem__(self, idx):
        input_text = self.inputs[idx]
        response_text = self.responses[idx]
        encoder_input_data = self.text_to_tensor(input_text)
        decoder_target_data = self.text_to_tensor(response_text)
        return encoder_input_data, decoder_target_data
    
    def text_to_tensor(self, text):
        # Example tokenization and conversion
        # Replace with your actual tokenization logic
        tokens = text.split()  # Basic tokenization
        tensor = torch.tensor([int(token) if token.isdigit() else 0 for token in tokens], dtype=torch.long)
        return tensor

def train_model():
    # Prepare data
    try:
        data = pd.read_csv('chat_data.csv')
    except FileNotFoundError:
        print("File 'chat_data.csv' not found. Please check the path.")
        return
    
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
