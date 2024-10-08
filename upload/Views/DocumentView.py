from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from upload.models import Document
from upload.models import User, Notification
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.urls import reverse_lazy
from django.http import JsonResponse
from upload.Serializers.DocumentSerializer import DocumentDashboardSerializer
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from django.utils.timezone import now
from upload.Serializers.DocumentSerializer import DocumentUploadSerializer
from upload.Serializers.DocumentSerializer import DocumentRateSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_http_methods


@csrf_exempt  
@require_http_methods(["DELETE"])
def delete_documents(request):
    try:
        # Parse the image_ids from the request body (expects JSON payload)
        data = json.loads(request.body)
        document_ids = data.get('document_ids', [])

        if not document_ids:
            return HttpResponseBadRequest(JsonResponse({'error': 'No Document IDs provided'}, status=400))

        # Delete images that match the provided IDs
        documents = Document.objects.filter(id__in=document_ids)
        deleted_count, _ = documents.delete()

        return JsonResponse({'message': f'{deleted_count} document(s) deleted successfully'}, status=204)
    except json.JSONDecodeError:
        return HttpResponseBadRequest(JsonResponse({'error': 'Invalid JSON'}, status=400))


class DocumentRateAPIView(generics.UpdateAPIView):
    queryset = Document.objects.all()
    
    serializer_class = DocumentRateSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()

        instance.rating = request.query_params.get('rating', instance.rating)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)



class DocumentUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    @csrf_exempt
    def post(self, request, *args, **kwargs):
   
        serializer = DocumentUploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            new_document = serializer.save(user=request.user)
            user_departments = request.user.departments.all()

            # Fetch department admins whose departments intersect with the user's departments
            department_admins = User.objects.filter(
                role='departmentadmin',
                departments__in=user_departments
            ).distinct()

            
            super_admins = User.objects.filter(role='superadmin')

            
            admin_users = set(department_admins) | set(super_admins)

            admin_message = f"New Document {new_document.title} uploaded by {request.user.username}"

            for admin_user in admin_users:
                Notification.objects.create(user=admin_user, message=admin_message)
            
            response_data = {
                'message': 'Posted successfully.',
                'document': {
                    'id': new_document.id,
                    'file': new_document.docfile.url,
                    'title': new_document.title,
                    'rating': new_document.rating,
                     'status': new_document.status
                    
                }
            }

            return JsonResponse(response_data,status=200)
        else:
            return JsonResponse({'error': serializer.errors}, status=400)

@csrf_exempt  
@require_POST
def approve_documents(request):
    try:
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])

        documents = Document.objects.filter(id__in=task_ids)
        documents.update(status='Approved', status_change_date=now())
        for document in documents:
            Notification.objects.create(user=document.user, message=f'Your Document "{document.title}" has been approved.')
        return JsonResponse({'message': 'Document approved successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
@require_POST
def reject_documents(request):
  
    try: 
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])
        documents = Document.objects.filter(id__in=task_ids)
        documents.update(status='Rejected',status_change_date=now())
        for document in documents:
            Notification.objects.create(user=document.user, message=f'Your Document "{document.title}" has been rejected.')
        return JsonResponse({'message': 'Document rejected successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



class DocumentDashboardView(APIView):
    def get(self, request):
        documents = Document.objects.for_user(request.user)
       # print(request.user.username)
        serializer = DocumentDashboardSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DocumentStatsAPI(APIView):    
    def get(self, request, format=None):
        documents = Document.objects.for_user(request.user)
        total_count = documents.count()
        pending_count = documents.filter(status='Pending').count()
        approved_count = documents.filter(status='Approved').count()
        rejected_count = documents.filter(status='Rejected').count()

        data = {
            'total_count': total_count,
            'pending_count': pending_count,
            'approved_count': approved_count,
            'rejected_count': rejected_count,
        }
        return Response(data)



    


          