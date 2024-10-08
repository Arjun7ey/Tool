import json
import requests
import logging
import os
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from upload.models import InstagramCredentials  # Import your model

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Ensure debug level is enabled

# Path to the mkcert CA certificate
# mkcert_ca_cert_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'localhost+2.pem')

# Debugging: Log the path
logger.debug(f'CA certificate path: {mkcert_ca_cert_path}')

# Check if the file exists
if not os.path.exists(mkcert_ca_cert_path):
    logger.error(f'CA certificate file does not exist at: {mkcert_ca_cert_path}')
    # Handle the error, e.g., return an appropriate response or raise an exception
else:
    logger.info(f'CA certificate file exists at: {mkcert_ca_cert_path}')

class InstagramAuthView(View):
    def get(self, request):
        # Redirect to Instagram authorization URL
        auth_url = (
            'https://api.instagram.com/oauth/authorize'
            f'?client_id={settings.INSTAGRAM_APP_ID}'
            f'&redirect_uri={settings.INSTAGRAM_REDIRECT_URI}'
            '&scope=user_profile,user_media'
            '&response_type=code'
        )
        logger.info(f'Redirecting to Instagram authorization URL: {auth_url}')
        return redirect(auth_url)


class InstagramCallbackView(View):
    def get(self, request):
        code = request.GET.get('code')
        if code:
            try:
                access_token_response = requests.post(
                    'https://api.instagram.com/oauth/access_token',
                    data={
                        'client_id': settings.INSTAGRAM_APP_ID,
                        'client_secret': settings.INSTAGRAM_APP_SECRET,
                        'grant_type': 'authorization_code',
                        'redirect_uri': settings.INSTAGRAM_REDIRECT_URI,
                        'code': code
                    },
                    verify=False  # Disable SSL verification
                )
                access_token_response.raise_for_status()
                access_token_info = access_token_response.json()
                access_token = access_token_info.get('access_token')

                if access_token:
                    long_lived_token_response = requests.get(
                        'https://graph.instagram.com/access_token',
                        params={
                            'grant_type': 'ig_exchange_token',
                            'client_secret': settings.INSTAGRAM_APP_SECRET,
                            'access_token': access_token
                        },
                        verify=False  # Disable SSL verification
                    )
                    long_lived_token_response.raise_for_status()
                    long_lived_token_info = long_lived_token_response.json()
                    long_lived_access_token = long_lived_token_info.get('access_token')

                    user_profile_response = requests.get(
                        'https://graph.instagram.com/me',
                        params={
                            'fields': 'id,username',
                            'access_token': long_lived_access_token
                        },
                        verify=False  # Disable SSL verification
                    )
                    user_profile_response.raise_for_status()
                    user_profile = user_profile_response.json()
                    instagram_account_id = user_profile.get('id')

                    # Update or create the InstagramCredentials instance
                    InstagramCredentials.objects.update_or_create(
                        defaults={
                            'access_token': long_lived_access_token,
                            'instagram_account_id': instagram_account_id,
                        }
                    )

                    return redirect('https://localhost:3000/link')

            except requests.exceptions.RequestException as e:
                logger.error(f'Failed to authenticate with Instagram: {str(e)}')
                return render(request, 'error.html', {'error': f'Failed to authenticate with Instagram: {str(e)}'})

        logger.error('Failed to authenticate with Instagram: No code provided')
        return render(request, 'error.html', {'error': 'Failed to authenticate with Instagram'})


@csrf_exempt
def post_to_instagram(request):
    if request.method == 'POST':
        try:
            credentials = InstagramCredentials.objects.first()
            if not credentials:
                return JsonResponse({'error': 'Instagram credentials not found.'}, status=500)
            access_token = credentials.long_lived_token
            instagram_account_id = credentials.instagram_account_id
        except InstagramCredentials.DoesNotExist:
            return JsonResponse({'error': 'Instagram credentials not found.'}, status=500)
        
        status = request.POST.get('status', '')
        image_file = request.FILES.get('media')
        
        if not image_file:
            return JsonResponse({'error': 'No media file provided.'}, status=400)

        media_url = f'https://graph.facebook.com/v13.0/{instagram_account_id}/media'
        media_data = {
            'caption': status,
            'access_token': access_token
        }
        media_files = {
            'image': image_file
        }

        try:
            media_response = requests.post(media_url, data=media_data, files=media_files, verify=False)
            logger.debug(f'Media Response Content: {media_response.content}')
            media_response.raise_for_status()
            media_response_data = media_response.json()
            media_id = media_response_data.get('id')
        except requests.exceptions.RequestException as e:
            logger.error(f'Failed to upload media: {str(e)}')
            logger.error(f'Media Response Content: {media_response.content}')
            return JsonResponse({'error': f'Failed to upload media: {str(e)}'}, status=400)
        
        publish_url = f'https://graph.facebook.com/v13.0/{instagram_account_id}/media_publish'
        publish_data = {
            'creation_id': media_id,
            'access_token': access_token
        }

        try:
            publish_response = requests.post(publish_url, data=publish_data, verify=False)
            logger.debug(f'Publish Response Content: {publish_response.content}')
            publish_response.raise_for_status()
            publish_response_data = publish_response.json()
            logger.debug(f'Publish Response: {publish_response_data}')
        except requests.exceptions.RequestException as e:
            logger.error(f'Failed to publish media: {str(e)}')
            logger.error(f'Publish Response Content: {publish_response.content}')
            return JsonResponse({'error': f'Failed to publish media: {str(e)}'}, status=400)
        
        return JsonResponse(publish_response_data)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)