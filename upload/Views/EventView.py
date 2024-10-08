from django.shortcuts import render
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login
from django.urls import reverse_lazy
from django.shortcuts import render,redirect, get_object_or_404
from django.shortcuts import render, get_object_or_404, redirect    
from django.contrib.auth.decorators import login_required
from upload.models import Content, Category
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import generics
from upload.Serializers.ContentSerializer import ContentSerializer
from upload.Serializers.EventSerializer import EventSerializer
from upload.models import Event

class ContentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer

class ContentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer   

class EventListCreateAPIView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:  
            return Event.objects.all() 
        else:
            
            departments = user.departments.all()
            
            return Event.objects.filter(department__in=departments)


    def perform_create(self, serializer):
        # Set the created_by field to the current user
        event = serializer.save(created_by=self.request.user)

        # Create a Category with the name of the event's title
        category_name = f"Event - {event.title}"
        Category.objects.create(name=category_name)


    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            print(serializer.errors)  # Print errors to the console
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class EventRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer   













