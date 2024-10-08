from django.shortcuts import render
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from upload.models import Image, Notification
from upload.Serializers.ImageSerializer import ImageSerializer
from upload.models import User 
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.urls import reverse_lazy
from django.shortcuts import render, get_object_or_404, redirect    
from django.contrib.auth.decorators import login_required
from datetime import datetime
from django.http import JsonResponse
from rest_framework import generics
from rest_framework import viewsets
from rest_framework import filters
from django.utils.timezone import now
import logging
from rest_framework.decorators import action
from django.views.decorators.http import require_POST
from upload.Serializers.ImageSerializer import ImageDashboardSerializer, ImageRateSerializer
from upload.Serializers.ImageSerializer import ImageUploadSerializer
from django.views.generic import ListView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.parsers import MultiPartParser, FormParser
import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_http_methods


logger = logging.getLogger(__name__)

@csrf_exempt  
@require_http_methods(["DELETE"])
def delete_images(request):
    try:
        # Parse the image_ids from the request body (expects JSON payload)
        data = json.loads(request.body)
        image_ids = data.get('image_ids', [])

        if not image_ids:
            return HttpResponseBadRequest(JsonResponse({'error': 'No image IDs provided'}, status=400))

        # Delete images that match the provided IDs
        images = Image.objects.filter(id__in=image_ids)
        deleted_count, _ = images.delete()

        return JsonResponse({'message': f'{deleted_count} image(s) deleted successfully'}, status=204)
    except json.JSONDecodeError:
        return HttpResponseBadRequest(JsonResponse({'error': 'Invalid JSON'}, status=400))



@api_view(['GET'])
def fetch_approved_images(request):
    user=request.user
    
    if user.role == 'superadmin':
        
        images = Image.objects.filter(status='Approved')
    else:
      
        images = Image.objects.filter(
            status='Approved',
            department__in=user.departments.all()
        ).distinct()
    data = []
    for img in images:
        data.append({
            'id': img.id,
            'title': img.title,
            'image_url': img.image.url if img.image else None,
            'category': img.category.name if img.category else 'N/A',
            'department': img.department.name if img.department else 'N/A',
            'user': img.get_username(),
            'rating': img.rating,
            'tags': [tag.name for tag in img.tags.all()],
        })
    return JsonResponse({'images': data})


class CheckUniqueImageTitle(APIView):
    def get(self, request, *args, **kwargs):
        title = self.request.query_params.get('title', None)
        if not title:
            return Response({'error': 'Title parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if title is unique
        if Image.objects.filter(title=title).exists():
            return Response({'isUnique': False}, status=status.HTTP_200_OK)
        else:
            return Response({'isUnique': True}, status=status.HTTP_200_OK)


class ImageRateAPIView(generics.UpdateAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageRateSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)




@csrf_exempt
@require_POST
def approve_tasks(request):
    try:
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])

        images = Image.objects.filter(id__in=task_ids)
        # Update status and status_change_date
        images.update(status='Approved', status_change_date=now())

        # Create notifications with image titles
        for image in images:
            Notification.objects.create(
                user=image.user,
                message=f'Image "{image.title}" has been approved.'
            )

        return JsonResponse({'message': 'Images approved successfully.'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def reject_tasks(request):
    try: 
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])

        images = Image.objects.filter(id__in=task_ids)
        # Update status and status_change_date
        images.update(status='Rejected', status_change_date=now())

        # Create notifications with image titles
        for image in images:
            Notification.objects.create(
                user=image.user,
                message=f'Image "{image.title}" has been rejected.'
            )

        return JsonResponse({'message': 'Images rejected successfully.'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    
class ImageUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    @csrf_exempt  
    def post(self, request, *args, **kwargs):
       
        serializer = ImageUploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            new_image = serializer.save(user=request.user)
            user_departments = request.user.departments.all()

            # Fetch department admins whose departments intersect with the user's departments
            department_admins = User.objects.filter(
                role='departmentadmin',
                departments__in=user_departments
            ).distinct()

           
            super_admins = User.objects.filter(role='superadmin')

            
            admin_users = set(department_admins) | set(super_admins)

            admin_message = f"New image {new_image.title} uploaded by {request.user.username}"

            for admin_user in admin_users:
                Notification.objects.create(user=admin_user, message=admin_message)
            
            response_data = {
                'message': 'Uploaded successfully.',
                'image': {
                    'id': new_image.id,
                    'rating': new_image.rating,
                    'image_url': new_image.image.url if new_image.image else None,
                    'status': new_image.status
                   
                }
            }

            return JsonResponse( response_data, status=200)
        else:
            return JsonResponse({'error': serializer.errors}, status=400)
        
class ImageDashboardView(APIView):
    def get(self, request):
        images = Image.objects.for_user(request.user)
       # print(request.user.username)
        serializer = ImageDashboardSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['status']

    def get_queryset(self):
        status = self.request.query_params.get('status', None)
        if status:
            logger.debug(f"Filtering images with status: {status}")
            return Image.objects.filter(status=status)
        logger.debug("Returning all images")
        return Image.objects.all()

@api_view(['PATCH'])
def update_image_rating(request, image_id):
    try:
        image = Image.objects.get(pk=image_id)
    except Image.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

    if 'rating' in request.data:
        image.rating = request.data['rating']
        image.save()
        serializer = ImageSerializer(image)  
        return Response({'success': 'Rating updated', 'image': serializer.data}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    


class ImageStatsAPI(APIView):
    
    def get(self, request, format=None):
        images = Image.objects.for_user(request.user)
        #images=Image.objects.all()
        total_count = images.count()
        pending_count = images.filter(status='Pending').count()
        approved_count = images.filter(status='Approved').count()
        rejected_count = images.filter(status='Rejected').count()

        data = {
            'total_count': total_count,
            'pending_count': pending_count,
            'approved_count': approved_count,
            'rejected_count': rejected_count,
        }   
        return Response(data)
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_image_status(request, image_id):
    try:
        image = Image.objects.get(pk=image_id)
    except Image.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

    if 'status' not in request.data:
        return Response({'error': 'Status not provided'}, status=status.HTTP_400_BAD_REQUEST)

    old_status = image.status
    new_status = request.data['status']
    image.status = new_status
    print(old_status,new_status)
    image.save()

    if old_status == 'Pending' and new_status in ['Approved', 'Rejected']:
        message = f"Your image has been {new_status}."
        Notification.objects.create(user=image.user, message=message)

    return Response({'status': 'Status updated successfully'}, status=status.HTTP_200_OK)


class ImageList(APIView):
    def post(self, request):
        serializer= ImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class ImageListView(generics.ListCreateAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer    
    
    def get(self, request):
        images= Image.objects.all()
        serializer= ImageSerializer(images,many=True)
        return Response(serializer.data)


    

