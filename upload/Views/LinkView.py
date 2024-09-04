from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from upload.models import Image, Notification
from upload.Serializers.LinkSerializer import LinkSerializer
from upload.models import User , Link
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render,redirect, get_object_or_404
from django.http import JsonResponse
from rest_framework import generics
from rest_framework import viewsets
from rest_framework import filters
import logging
from django.utils.decorators import method_decorator
from django.http import JsonResponse, HttpResponseBadRequest
from rest_framework.decorators import action
from django.views.decorators.http import require_POST, require_http_methods
from upload.Serializers.LinkSerializer import LinkDashboardSerializer, LinkRateSerializer
from upload.Serializers.LinkSerializer import LinkUploadSerializer
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
import json

logger = logging.getLogger(__name__)

@csrf_exempt  
@require_http_methods(["DELETE"])
def delete_links(request):
    try:
        data = json.loads(request.body)
        print(data)
        link_ids = data.get('link_ids', [])

        if not link_ids:
            return HttpResponseBadRequest(JsonResponse({'error': 'No link IDs provided'}, status=400))

        links = Link.objects.filter(id__in=link_ids)
        deleted_count, _ = links.delete()

        return JsonResponse({'message': f'{deleted_count} Link(s) deleted successfully'}, status=204)
    except json.JSONDecodeError:
        return HttpResponseBadRequest(JsonResponse({'error': 'Invalid JSON'}, status=400))


class CheckUniqueLinkTitle(APIView):
    def get(self, request, *args, **kwargs):
        title = self.request.query_params.get('title', None)
        if not title:
            return Response({'error': 'Title parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if title is unique
        if Link.objects.filter(title=title).exists():
            return Response({'isUnique': False}, status=status.HTTP_200_OK)
        else:
            return Response({'isUnique': True}, status=status.HTTP_200_OK)


class LinkRateAPIView(generics.UpdateAPIView):
    queryset = Link.objects.all()
    serializer_class = LinkRateSerializer

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

        links = Link.objects.filter(id__in=task_ids)
        links.update(status='Approved')
        for link in links:
            Notification.objects.create(user=link.user, message='Your Link has been approved.')
        return JsonResponse({'message': 'Link approved successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
@require_POST
def reject_tasks(request):
  
    try: 
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        task_ids = body.get('task_ids', [])
        links = Link.objects.filter(id__in=task_ids)
        links.update(status='Rejected')
        for link in links:
            Notification.objects.create(user=link.user, message='Your Link has been rejected.')
        return JsonResponse({'message': 'Links rejected successfully.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

class LinkUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Print the entire request data to see what is being sent
        

        serializer = LinkUploadSerializer(data=request.data, context={'request': request})
        
        # Print if serializer is valid or not
        if serializer.is_valid():
            
            new_link = serializer.save(user=request.user)

            # Fetch departments and users as needed
            user_departments = request.user.departments.all()
            

            department_admins = User.objects.filter(
                role='departmentadmin',
                departments__in=user_departments
            ).distinct()
           
            
            super_admins = User.objects.filter(role='superadmin')
            

            admin_users = set(department_admins) | set(super_admins)
            

            admin_message = f"New Link uploaded by {request.user.username}"
            for admin_user in admin_users:
                Notification.objects.create(user=admin_user, message=admin_message)
            
            response_data = {
                'message': 'Uploaded successfully.',
                'link': {
                    'id': new_link.id,
                    'rating': new_link.rating,
                    'image_url': new_link.image.url if new_link.image else None,
                   
                }
            }
            return JsonResponse(response_data, status=200)
        else:
            # Print serializer errors for debugging
            print("Serializer Errors:", serializer.errors)
            return JsonResponse({'error': serializer.errors}, status=400)
        
class LinkDashboardView(APIView):
    def get(self, request):
        links = Link.objects.for_user(request.user)
       # print(request.user.username)
        serializer = LinkDashboardSerializer(links, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LinkViewSet(viewsets.ModelViewSet):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['status']

    def get_queryset(self):
        status = self.request.query_params.get('status', None)
        if status:
            logger.debug(f"Filtering links with status: {status}")
            return Link.objects.filter(status=status)
        logger.debug("Returning all links")
        return Link.objects.all()

@api_view(['PATCH'])
def update_link_rating(request, link_id):
    try:
        link = Link.objects.get(pk=link_id)
    except Link.DoesNotExist:
        return Response({'error': 'Link not found'}, status=status.HTTP_404_NOT_FOUND)

    if 'rating' in request.data:
        link.rating = request.data['rating']
        link.save()
        serializer = LinkSerializer(link)  
        return Response({'success': 'Rating updated', 'link': serializer.data}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    


class LinkStatsAPI(APIView):
    
    def get(self, request, format=None):
        links = Link.objects.for_user(request.user)
        total_count = links.count()
        pending_count = links.filter(status='Pending').count()
        approved_count = links.filter(status='Approved').count()
        rejected_count = links.filter(status='Rejected').count()

        data = {
            'total_count': total_count,
            'pending_count': pending_count,
            'approved_count': approved_count,
            'rejected_count': rejected_count,
        }   
        return Response(data)
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_link_status(request, link_id):
    try:
        link = Link.objects.get(pk=link_id)
    except Link.DoesNotExist:
        return Response({'error': 'Link not found'}, status=status.HTTP_404_NOT_FOUND)

    if 'status' not in request.data:
        return Response({'error': 'Status not provided'}, status=status.HTTP_400_BAD_REQUEST)

    old_status = link.status
    new_status = request.data['status']
    link.status = new_status
    print(old_status,new_status)
    link.save()

    if old_status == 'Pending' and new_status in ['Approved', 'Rejected']:
        message = f"Your link has been {new_status}."
        Notification.objects.create(user=link.user, message=message)

    return Response({'status': 'Status updated successfully'}, status=status.HTTP_200_OK)


class LinkList(APIView):
    def post(self, request):
        serializer= LinkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class LinkListView(generics.ListCreateAPIView):
    queryset = Link.objects.all()
    serializer_class = LinkSerializer    
    
    def get(self, request):
        links= Link.objects.all()
        serializer= LinkSerializer(links,many=True)
        return Response(serializer.data)


    

