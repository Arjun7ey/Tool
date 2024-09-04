from datetime import datetime, timedelta
from django.http import JsonResponse
from rest_framework.views import APIView
from upload.models import Department, Image, Video

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
