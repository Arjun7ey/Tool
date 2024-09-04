from django.shortcuts import render, redirect, get_object_or_404
from rest_framework import status, generics, viewsets, filters
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.utils.timezone import now
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.http import JsonResponse, HttpResponseBadRequest
from rest_framework.parsers import MultiPartParser, FormParser
import json
import logging

from upload.models import Video, Notification, User
from upload.Serializers.VideoSerializer import (
    VideoSerializer, 
    VideoDashboardSerializer, 
    VideoRateSerializer, 
    VideoUploadSerializer
)

logger = logging.getLogger(__name__)

@csrf_exempt  
@require_http_methods(["DELETE"])
def delete_videos(request):
    try:
        data = json.loads(request.body)
        print(data)
        video_ids = data.get('video_ids', [])

        if not video_ids:
            return HttpResponseBadRequest(JsonResponse({'error': 'No video IDs provided'}, status=400))

        videos = Video.objects.filter(id__in=video_ids)
        deleted_count, _ = videos.delete()

        return JsonResponse({'message': f'{deleted_count} video(s) deleted successfully'}, status=204)
    except json.JSONDecodeError:
        return HttpResponseBadRequest(JsonResponse({'error': 'Invalid JSON'}, status=400))



@api_view(['GET'])
def fetch_approved_videos(request):
    user=request.user
    
    if user.role == 'superadmin':
        
        videos = Video.objects.filter(status='Approved')
    else:
       
        videos = Video.objects.filter(
            status='Approved',
            department__in=user.departments.all()
        ).distinct()

    data = []
    for video in videos:
        data.append({
            'id': video.id,
            'title': video.title,
            'video_url': video.video.url if video.video else None,
            'category': video.category.name if video.category else 'N/A',
            'department': video.department.name if video.department else 'N/A',
            'user': video.get_username(),
            'rating': video.rating,
            'tags': [tag.name for tag in video.tags.all()],
        })
    return JsonResponse({'videos': data})


class CheckUniqueVideoTitle(APIView):
    def get(self, request, *args, **kwargs):
        title = self.request.query_params.get('title', None)
        if not title:
            return Response({'error': 'Title parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Video.objects.filter(title=title).exists():
            return Response({'isUnique': False}, status=status.HTTP_200_OK)
        else:
            return Response({'isUnique': True}, status=status.HTTP_200_OK)


class VideoRateAPIView(generics.UpdateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoRateSerializer

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
def approve_videos(request):
    try:
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])

        videos = Video.objects.filter(id__in=task_ids)
        videos.update(status='Approved', status_change_date=now())

        for video in videos:
            Notification.objects.create(
                user=video.user,
                message=f'Video "{video.title}" has been approved.'
            )

        return JsonResponse({'message': 'Videos approved successfully.'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def reject_videos(request):
    try:
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])

        videos = Video.objects.filter(id__in=task_ids)
        videos.update(status='Rejected', status_change_date=now())

        for video in videos:
            Notification.objects.create(
                user=video.user,
                message=f'Video "{video.title}" has been rejected.'
            )

        return JsonResponse({'message': 'Videos rejected successfully.'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    
class VideoUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    @csrf_exempt  
    def post(self, request, *args, **kwargs):
        serializer = VideoUploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            new_video = serializer.save(user=request.user)
            user_departments = request.user.departments.all()

            department_admins = User.objects.filter(
                role='departmentadmin',
                departments__in=user_departments
            ).distinct()

            super_admins = User.objects.filter(role='superadmin')

            admin_users = set(department_admins) | set(super_admins)

            admin_message = f"New Video {new_video.title} uploaded by {request.user.username}."

            for admin_user in admin_users:
                Notification.objects.create(user=admin_user, message=admin_message)

            response_data = {
                'message': 'Uploaded successfully.',
                'video': {
                    'id': new_video.id,
                    'rating': new_video.rating,
                    'video_url': new_video.video.url if new_video.video else None,
                   
                }
            }
 
            return JsonResponse(response_data, status=200)
        else:
            return JsonResponse({'error': serializer.errors}, status=400)
        
class VideoDashboardView(APIView):
    def get(self, request):
        videos = Video.objects.for_user(request.user)
        serializer = VideoDashboardSerializer(videos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['status']

    def get_queryset(self):
        status = self.request.query_params.get('status', None)
        if status:
            logger.debug(f"Filtering videos with status: {status}")
            return Video.objects.filter(status=status)
        logger.debug("Returning all videos")
        return Video.objects.all()


@api_view(['PATCH'])
def update_video_rating(request, video_id):
    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)

    if 'rating' in request.data:
        video.rating = request.data['rating']
        video.save()
        serializer = VideoSerializer(video)
        return Response({'success': 'Rating updated', 'video': serializer.data}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)


class VideoStatsAPI(APIView):
    def get(self, request, format=None):
        videos = Video.objects.for_user(request.user)
        total_count = videos.count()
        pending_count = videos.filter(status='Pending').count()
        approved_count = videos.filter(status='Approved').count()
        rejected_count = videos.filter(status='Rejected').count()

        data = {
            'total_count': total_count,
            'pending_count': pending_count,
            'approved_count': approved_count,
            'rejected_count': rejected_count,
        }   
        return Response(data)
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_video_status(request, video_id):
    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)

    if 'status' not in request.data:
        return Response({'error': 'Status not provided'}, status=status.HTTP_400_BAD_REQUEST)

    old_status = video.status
    new_status = request.data['status']
    video.status = new_status
    video.save()

    if old_status == 'Pending' and new_status in ['Approved', 'Rejected']:
        message = f"Your video has been {new_status}."
        Notification.objects.create(user=video.user, message=message)

    return Response({'status': 'Status updated successfully'}, status=status.HTTP_200_OK)


class VideoList(APIView):
    def post(self, request):
        serializer = VideoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VideoListView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer    
    
    def get(self, request):
        videos = Video.objects.all()
        serializer = VideoSerializer(videos, many=True)
        return Response(serializer.data)
