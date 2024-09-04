from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from upload.models import User, Post, Notification
from django.contrib.auth import authenticate, login
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.urls import reverse_lazy
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from django.utils.timezone import now
from upload.Serializers.PostSerializer import PostUploadSerializer, PostDashboardSerializer, PostRateSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse, HttpResponseBadRequest

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_posts(request):
    try:
        data = json.loads(request.body)
        post_ids = data.get('post_ids', [])

        if not post_ids:
            return HttpResponseBadRequest(JsonResponse({'error': 'No Post IDs provided'}, status=400))

        posts = Post.objects.filter(id__in=post_ids)
        deleted_count, _ = posts.delete()

        return JsonResponse({'message': f'{deleted_count} post(s) deleted successfully'}, status=200)

    except json.JSONDecodeError:
        return HttpResponseBadRequest(JsonResponse({'error': 'Invalid JSON'}, status=400))
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_approved_posts(request):
    if request.method == 'GET':
        approved_posts = Post.objects.filter(status='Approved')
        posts_data = [
            {
                'id': post.id,
                'title': post.title,
                'description': post.description,
                'author': post.author,
                'department': post.department.name if post.department else None,
                'last_modified': post.last_modified.isoformat(),
                'category': post.category.name if post.category else None,
                'rating': post.rating,
                'user': post.user.username,
                'image': post.image.url if post.image else None,
                'video': post.video.url if post.video else None
            }
            for post in approved_posts
        ]
        return JsonResponse({'posts': posts_data})

    return JsonResponse({'error': 'Invalid request method'}, status=405)

class PostRateAPIView(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostRateSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.rating = request.query_params.get('rating', instance.rating)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)

class PostUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        # Print raw request data
        print('Raw request data:', request.data)

        # Print content types of files if any
        if 'image' in request.FILES:
            print('Image content type:', request.FILES['image'].content_type)
        if 'video' in request.FILES:
            print('Video content type:', request.FILES['video'].content_type)

        serializer = PostUploadSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Print serialized data
            print('Serialized data:', serializer.validated_data)

            # Save the validated data
            new_post = serializer.save(user=request.user)

            user_departments = request.user.departments.all()
            department_admins = User.objects.filter(
                role='departmentadmin',
                departments__in=user_departments
            ).distinct()
            super_admins = User.objects.filter(role='superadmin')
            admin_users = set(department_admins) | set(super_admins)

            admin_message = f"New Post by {request.user.username}"

            for admin_user in admin_users:
                Notification.objects.create(user=admin_user, message=admin_message)

            response_data = {
                'message': 'Posted successfully.',
                'post': {
                    'id': new_post.id,
                    'title': new_post.title,
                    'rating': new_post.rating,
                    'image_url': new_post.image.url if new_post.image else None,
                    'video_url': new_post.video.url if new_post.video else None,
                    'submitted_by': new_post.user.username,
                   # Assuming there's a created_at field
                }
            }

            return JsonResponse(response_data, status=200)
        else:
            # Print serializer errors
            print('Serializer errors:', serializer.errors)
            return JsonResponse({'error': serializer.errors}, status=400)

@csrf_exempt  
@require_POST
def approve_posts(request):
    try:
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])

        posts = Post.objects.filter(id__in=task_ids)
        posts.update(status='Approved', status_change_date=now())
        for post in posts:
            Notification.objects.create(user=post.user, message=f'Your Post "{post.title}" has been approved.')
        return JsonResponse({'message': 'Post approved successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def reject_posts(request):
    try:
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])
        posts = Post.objects.filter(id__in=task_ids)
        posts.update(status='Rejected', status_change_date=now())
        for post in posts:
            Notification.objects.create(user=post.user, message=f'Your Post "{post.title}" has been rejected.')
        return JsonResponse({'message': 'Post rejected successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

class PostDashboardView(APIView):
    def get(self, request):
        posts = Post.objects.for_user(request.user)
        serializer = PostDashboardSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PostStatsAPI(APIView):
    def get(self, request, format=None):
        posts = Post.objects.for_user(request.user)
        total_count = posts.count()
        pending_count = posts.filter(status='Pending').count()
        approved_count = posts.filter(status='Approved').count()
        rejected_count = posts.filter(status='Rejected').count()

        data = {
            'total_count': total_count,
            'pending_count': pending_count,
            'approved_count': approved_count,
            'rejected_count': rejected_count,
        }
        return Response(data)
