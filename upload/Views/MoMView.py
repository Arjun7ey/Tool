from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import views, status
from upload.Serializers.NotificationSerializer import NotificationSerializer
from upload.Serializers.MoMSerializer import MoMViewSerializer
from upload.Serializers.MoMSerializer import  MoMSerializer
from upload.Serializers.MoMRowSerializer import MoMRowSerializer
import logging
from django.views.decorators.http import require_http_methods
from openpyxl import Workbook
from upload.models import  MoM, MoMRow
from rest_framework import viewsets
from rest_framework.exceptions import NotFound
import json





class MoMViewSet(viewsets.ModelViewSet):
    queryset = MoM.objects.all()
    serializer_class = MoMSerializer

    def list(self, request, *args, **kwargs):
        
        mom_rows = MoMRow.objects.all().select_related('mom')
        
        # Create a dictionary to map MoM ID to their rows
        mom_dict = {}
        for row in mom_rows:
            if row.mom_id not in mom_dict:
                mom_dict[row.mom_id] = {
                    'mom': row.mom,
                    'rows': []
                }
            mom_dict[row.mom_id]['rows'].append(row)
        
        serializer_data = []
        for mom_id, data in mom_dict.items():
            mom_serializer = MoMSerializer(data['mom'])
            serialized_mom = mom_serializer.data
            serialized_mom['rows'] = MoMRowSerializer(data['rows'], many=True).data
            serializer_data.append(serialized_mom)
        
        return Response(serializer_data, status=status.HTTP_200_OK)

    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class MoMRowUpdateView(APIView):
    def patch(self, request, pk, *args, **kwargs):
        try:
            row = MoMRow.objects.get(sn_number=pk)
        except MoMRow.DoesNotExist:
            raise NotFound("MoMRow not found")

        serializer = MoMRowSerializer(row, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    



class MoMCreateViewSet(viewsets.ModelViewSet):
        queryset = MoM.objects.all()
        serializer_class = MoMViewSerializer

        def create(self, request, *args, **kwargs):
            
            
            
            serializer = self.get_serializer(data=request.data)
            
            print(request.data)
            if not serializer.is_valid():
              
                print("Validation Errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
           
            self.perform_create(serializer)
            
            
            headers = self.get_success_headers(serializer.data)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



@api_view(['POST'])
def generate_mom(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
      
        workbook = Workbook()
        sheet = workbook.active

        headers = list(data.keys())
        sheet.append(headers)
        
        
        row = [data[key] for key in headers]
        sheet.append(row)
        
       
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=meeting_minutes.xlsx'
        
        workbook.save(response)
        return response
