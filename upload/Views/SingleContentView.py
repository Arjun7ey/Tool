from datetime import datetime, timedelta
from django.http import JsonResponse
from rest_framework.views import APIView
from upload.models import Department, Image, Video , Post, Document,Division,User   
from upload.Serializers.ImageSerializer import ImageDashboardSerializer
from upload.Serializers.VideoSerializer import VideoDashboardSerializer
from upload.Serializers.PostSerializer import PostDashboardSerializer
from upload.Serializers.DocumentSerializer import DocumentDashboardSerializer
from django.db.models import Count


class MediaStatsView(APIView):
    def get(self, request, *args, **kwargs):
        departments = ['BSNL', 'NBM', 'Digital Bharat Nidhi']
        
        data = {}
        one_week_ago = datetime.now() - timedelta(days=7)
        
        for dept_name in departments:
            department = Department.objects.filter(name=dept_name).first()  # Fetch the department instance
            if department:
                total_images = Image.objects.filter(department=department).count()
                approved_images = Image.objects.filter(department=department, status='Approved').count()
                total_videos = Video.objects.filter(department=department).count()
                approved_videos = Video.objects.filter(department=department, status='Approved').count()

                # Weekly submissions
                weekly_images = Image.objects.filter(department=department, dated__gte=one_week_ago).count()
                weekly_approved_images = Image.objects.filter(department=department, status='Approved', dated__gte=one_week_ago).count()
                weekly_videos = Video.objects.filter(department=department, dated__gte=one_week_ago).count()
                weekly_approved_videos = Video.objects.filter(department=department, status='Approved', dated__gte=one_week_ago).count()

                total_media = total_images + total_videos
                approved_media = approved_images + approved_videos

                approval_percentage = (approved_media / total_media * 100) if total_media > 0 else 0

                data[dept_name] = {
                    'total_images': total_images,
                    'approved_images': approved_images,
                    'total_videos': total_videos,
                    'approved_videos': approved_videos,
                    'approval_percentage': approval_percentage,
                    'weekly_data': {
                        'total_images': weekly_images,
                        'approved_images': weekly_approved_images,
                        'total_videos': weekly_videos,
                        'approved_videos': weekly_approved_videos,
                    }
                }
            else:
                # Handle case where the department is not found
                data[dept_name] = {
                    'total_images': 0,
                    'approved_images': 0,
                    'total_videos': 0,
                    'approved_videos': 0,
                    'approval_percentage': 0,
                    'weekly_data': {
                        'total_images': 0,
                        'approved_images': 0,
                        'total_videos': 0,
                        'approved_videos': 0,
                    }
                }
       
        return JsonResponse(data)


def approved_media(request):
    category_name = request.GET.get('category_name')
   
    if not category_name:
        return JsonResponse({'error': 'Category name is required'}, status=400)

    # Fetch approved images with the matching category name
    approved_images = Image.objects.filter(
    status='Approved',
    category__name__icontains=category_name  # Use icontains for partial match
      )

# Fetch approved videos where category_name is a substring
    approved_videos = Video.objects.filter(
    status='Approved',
    category__name__icontains=category_name  # Use icontains for partial match
        )

    # Serialize the data
    image_serializer = ImageDashboardSerializer(approved_images, many=True)
    video_serializer = VideoDashboardSerializer(approved_videos, many=True)

    # Create a response format
    data = {
        'images': image_serializer.data,
        'videos': video_serializer.data
    }

    return JsonResponse(data)




def media_status_view(request):
    data = {
        'images': [],
        'documents': [],
        'posts': [],
        'videos': [],
        'divisions': [],
        'users': []
    }

    divisions = [
        'Pollution Control Board',
        'Forest and Wildlife Conservation Wing',
        'Climate Change and Sustainable Development Cell',
        'Environmental Planning and Coordination Organization'
    ]

    # Fetch all Images
    images = Image.objects.all()
    image_serializer = ImageDashboardSerializer(images, many=True)
    data['images'] = image_serializer.data
    
    # Fetch all Documents
    documents = Document.objects.all()
    document_serializer = DocumentDashboardSerializer(documents, many=True)
    data['documents'] = document_serializer.data
    
    # Fetch all Posts
    posts = Post.objects.all()
    post_serializer = PostDashboardSerializer(posts, many=True)
    data['posts'] = post_serializer.data

    # Fetch all Videos
    videos = Video.objects.all()
    video_serializer = VideoDashboardSerializer(videos, many=True)
    data['videos'] = video_serializer.data

    # Fetch division-specific data
    for division_name in divisions:
        division = Division.objects.filter(name=division_name).first()
        if division:
            division_data = {
                'name': division.name,
                'image_count': Image.objects.filter(division=division).count(),
                'document_count': Document.objects.filter(division=division).count(),
                'post_count': Post.objects.filter(division=division).count(),
                'video_count': Video.objects.filter(division=division).count()
            }
            data['divisions'].append(division_data)

    # Fetch user data
    users = User.objects.annotate(
        image_count=Count('image'),
        document_count=Count('document'),
        post_count=Count('post'),
        video_count=Count('video')
    )
    for user in users:
        user_data = {
            'username': user.username,
            'image_count': user.image_count,
            'document_count': user.document_count,
            'post_count': user.post_count,
            'video_count': user.video_count,
            'total_content': user.image_count + user.document_count + user.post_count + user.video_count
        }
        data['users'].append(user_data)

    return JsonResponse(data)