from django.shortcuts import render
from upload.models import Image, Category
from upload.Serializers.CategorySerializer import CategorySerializer
from rest_framework import generics




class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer




       

       
      



