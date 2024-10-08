import json
import logging
import requests
from django.conf import settings
from django.http import JsonResponse
from django.utils.encoding import force_str
from requests_oauthlib import OAuth1Session
from PIL import Image
import io
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from requests_oauthlib import OAuth1Session
from requests.exceptions import HTTPError
from upload.models import Engagement, Tweet, User
from django.contrib.auth.decorators import login_required
# Set up logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

# Disable SSL verification globally
requests.packages.urllib3.disable_warnings(requests.packages.urllib3.exceptions.InsecureRequestWarning)

# Custom session class to disable SSL verification
class CustomSession(requests.Session):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.verify = True

# Check if the user has access tokens stored in the session
def check_authentication(request):
    access_token = request.session.get('access_token')
    access_token_secret = request.session.get('access_token_secret')
    is_authenticated = bool(access_token and access_token_secret)
    return JsonResponse({'is_authenticated': is_authenticated})

# Start Twitter authentication flow
def twitter_login(request):
    oauth = OAuth1Session(
        settings.TWITTER_API['CONSUMER_KEY'],
        client_secret=settings.TWITTER_API['CONSUMER_SECRET'],
    )
    request_token_url = 'https://api.twitter.com/oauth/request_token'
    oauth.fetch_request_token(request_token_url)

    redirect_url = oauth.authorization_url('https://api.twitter.com/oauth/authenticate')
    request.session['oauth_token'] = oauth.token['oauth_token']
    request.session['oauth_token_secret'] = oauth.token['oauth_token_secret']

    return redirect(redirect_url)

# Handle Twitter callback
def twitter_callback(request):
    oauth_token = request.GET.get('oauth_token')
    oauth_verifier = request.GET.get('oauth_verifier')

    token = request.session.get('oauth_token')
    token_secret = request.session.get('oauth_token_secret')

    oauth = OAuth1Session(
        settings.TWITTER_API['CONSUMER_KEY'],
        client_secret=settings.TWITTER_API['CONSUMER_SECRET'],
        resource_owner_key=token,
        resource_owner_secret=token_secret,
        verifier=oauth_verifier
    )

    access_token_url = 'https://api.twitter.com/oauth/access_token'
    response = oauth.fetch_access_token(access_token_url)
    access_token = response.get('oauth_token')
    access_token_secret = response.get('oauth_token_secret')

    # Save access token and secret in session or database
    request.session['access_token'] = access_token
    request.session['access_token_secret'] = access_token_secret

    # Redirect to the TweetForm page with a success message
    return redirect('https://localhost:3000/link/?message=success')

@csrf_exempt
def post_text_to_twitter(request):
    if request.method == 'POST':
        try:
            status = request.POST.get('status', '')
            user_id = request.POST.get('user_id', None)

            if not status:
                return JsonResponse({'error': 'Status is required'}, status=400)

            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return JsonResponse({'error': 'Invalid user'}, status=400)
            else:
                return JsonResponse({'error': 'User ID is required'}, status=400)

            oauth = OAuth1Session(
                settings.TWITTER_API['CONSUMER_KEY'],
                client_secret=settings.TWITTER_API['CONSUMER_SECRET'],
                resource_owner_key=settings.TWITTER_API['ACCESS_TOKEN'],
                resource_owner_secret=settings.TWITTER_API['ACCESS_TOKEN_SECRET']
            )

            tweet_response = oauth.post(
                'https://api.twitter.com/2/tweets',
                json={'text': status},
                verify=True  # Consider setting verify=True in production
            )
            tweet_response.raise_for_status()

            response_data = tweet_response.json()
            logger.debug('Twitter API Response: %s', json.dumps(response_data, indent=2))

            tweet_id = response_data['data']['id']

            tweet = Tweet(
                user=user,
                tweet_id=tweet_id,
                status=status,
                media_url='',
            )
            tweet.save()

            return JsonResponse({'success': True, 'tweet_id': tweet_id})

        except Exception as e:
            logger.error(f'Exception occurred: {str(e)}')
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)




@csrf_exempt
def post_text_with_media_to_twitter(request):
    if request.method == 'POST':
        try:
            status = force_str(request.POST.get('status', ''))
            media = request.FILES.get('media', None)
            user_id = request.POST.get('user_id', None)
            
            print("Data received from frontend:")
            print(f"Status: {status}")
            print(f"Media: {media}")
            print(f"User ID: {user_id}")

            if not status:
                return JsonResponse({'error': 'Status is required'}, status=400)

            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return JsonResponse({'error': 'Invalid user'}, status=400)
            else:
                return JsonResponse({'error': 'User ID is required'}, status=400)

            oauth = OAuth1Session(
                settings.TWITTER_API['CONSUMER_KEY'],
                client_secret=settings.TWITTER_API['CONSUMER_SECRET'],
                resource_owner_key=settings.TWITTER_API['ACCESS_TOKEN'],
                resource_owner_secret=settings.TWITTER_API['ACCESS_TOKEN_SECRET']
            )

            media_id = None
            if media:
                try:
                    # Compress image if it's too large
                    img = Image.open(media)
                    img_io = io.BytesIO()
                    img.save(img_io, format='JPEG', quality=70, optimize=True)
                    img_io.seek(0)
                    
                    if img_io.getbuffer().nbytes > 5 * 1024 * 1024:  # 5MB limit
                        return JsonResponse({'error': 'Image file is too large. Please use an image smaller than 5MB.'}, status=400)
                    
                    media_response = oauth.post(
                        'https://upload.twitter.com/1.1/media/upload.json',
                        files={'media': img_io},
                        verify=False  # Consider setting verify=True in production
                    )
                    media_response.raise_for_status()
                    media_data = media_response.json()
                    media_id = media_data.get('media_id_string')
                    print(f"Media upload response: {media_data}")
                except Exception as e:
                    print(f"Media upload failed: {str(e)}")
                    logger.error(f'Media upload failed: {str(e)}')
                    media_id = None

            print("Posting tweet to Twitter:")
            print(f"Status text: {status}")
            print(f"Media ID: {media_id}")
            
            tweet_data = {'text': status}
            if media_id:
                tweet_data['media'] = {'media_ids': [media_id]}
            
            print(f"Tweet data being sent: {tweet_data}")

            tweet_response = oauth.post(
                'https://api.twitter.com/2/tweets',
                json=tweet_data,
                verify=False  # Consider setting verify=True in production
            )
            tweet_response.raise_for_status()

            response_data = tweet_response.json()
            print(f"Twitter API Response: {json.dumps(response_data, indent=2)}")
            logger.debug('Twitter API Response: %s', json.dumps(response_data, indent=2))

            tweet_id = response_data['data']['id']

            try:
                tweet = Tweet(
                    user=user,
                    tweet_id=tweet_id,
                    status=status,
                    media_url=media_data.get('media_url', '') if media and media_id else '',
                )
                tweet.save()
            except Exception as db_error:
                logger.error(f'Error saving tweet to database: {str(db_error)}')
                # Continue execution even if database save fails

            return JsonResponse({'success': True, 'tweet_id': tweet_id})

        except Exception as e:
            print(f"Critical exception occurred: {str(e)}")
            logger.error(f'Critical exception occurred: {str(e)}')
            return JsonResponse({'error': 'A critical error occurred while posting. Please try again.'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)