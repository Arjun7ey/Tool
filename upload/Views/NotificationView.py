from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from upload.models import Image, Category
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import views, status
import logging
from django.views.decorators.http import require_http_methods
from openpyxl import Workbook
from upload.models import  Notification



@api_view(['POST'])
def  mark_notifications_as_read(request):
  
    notifications = Notification.objects.filter(user=request.user, read=False)
    print(request.user.username)
    notifications.update(read=True)
    return Response(status=status.HTTP_204_NO_CONTENT)

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
 
       
        if user.role == 'superadmin':
    
             notifications = Notification.objects.all()
        elif user.role in ['departmentadmin', 'user', 'readonlyuser']:

             notifications = Notification.objects.filter(user=user)
        else:
   
             notifications = []

        
        data = [{'id': notification.id, 'message': notification.message, 'timestamp': notification.timestamp, 'read': notification.read} for notification in notifications]
        
        return Response(data)
    
class NotificationListDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
 
       
        if user.role == 'superadmin':
    
           notifications = Notification.objects.all()
        elif user.role in ['departmentadmin', 'user', 'readonlyuser']:

             notifications = Notification.objects.filter(user=user)
        else:
   
             notifications = []


        
        data = [{'id': notification.id, 'message': notification.message, 'timestamp': notification.timestamp} for notification in notifications]
        
        return Response(data)    