from django.http import JsonResponse,HttpResponse
from upload.models import Tweet, Image
from django.views.decorators.http import require_http_methods
import requests
from urllib.parse import urlencode
import json
import numpy as np
import torch
from torchvision import models, transforms
from PIL import Image
import requests
from io import BytesIO
import time
import logging
import numpy as np
import cv2
from transformers import BlipProcessor, BlipForConditionalGeneration
import cv2
import time
from django.views.decorators.http import require_POST
from google.cloud import vision
import os
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import re
from django.utils.decorators import method_decorator
from urllib.parse import quote
from django.core.files.storage import default_storage
import http.client
import urllib.parse
from urllib.parse import urlencode, quote
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import requests
from io import BytesIO
import traceback
import logging
import warnings 
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image as PILImage 

logger = logging.getLogger(__name__)

@require_http_methods(["GET"])
def fetch_tweet_details(request, tweet_id):
    url = "https://twitter-api47.p.rapidapi.com/v2/tweet/details"
    headers = {
        'x-rapidapi-key': 'a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b',  # Replace with your actual RapidAPI key
        'x-rapidapi-host': 'twitter-api47.p.rapidapi.com'
    }
    params = {'tweetId': tweet_id}

    try:
        response = requests.get(url, headers=headers, params=params, verify=False)  # SSL verification disabled

        if response.status_code == 200:
            data = response.json()

            # Extract relevant information
            retweets = data.get('details', {}).get('legacy', {}).get('retweet_count', 0)
            likes = data.get('details', {}).get('legacy', {}).get('favorite_count', 0)

            # Send only retweets and likes
            return JsonResponse({
                'retweets': retweets,
                'likes': likes,
            })
        else:
            return JsonResponse({'error': 'Failed to fetch tweet details'}, status=response.status_code)
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_tweet_ids(request):
    tweets = Tweet.objects.all().values('id', 'tweet_id')
    return JsonResponse(list(tweets), safe=False)

def resolve_urls(urls):
    resolved_urls = {}
    for url in urls:
        try:
            response = requests.head(url, allow_redirects=True, verify=False)
            resolved_urls[url] = response.url
        except requests.RequestException as e:
            print(f"Error resolving URL: {e}")
            resolved_urls[url] = url  # Use the original URL if resolution fails
    return resolved_urls

@require_http_methods(["GET"])
def search_twitter(request):
    query = request.GET.get('query', '')
    
    if not query:
        return JsonResponse({'error': 'Query parameter is missing'}, status=400)
    
    encoded_query = urllib.parse.quote(query)
    url = f"/Search/?q={encoded_query}&count=20&type=Top&safe_search=true"

    conn = http.client.HTTPSConnection("twitter135.p.rapidapi.com")
    headers = {
        'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",
        'x-rapidapi-host': "twitter135.p.rapidapi.com"
    }
    
    conn.request("GET", url, headers=headers)
    res = conn.getresponse()
    data = res.read()

    try:
        json_data = json.loads(data.decode("utf-8"))

        tweets = []

        instructions = json_data.get('data', {}).get('search_by_raw_query', {}).get('search_timeline', {}).get('timeline', {}).get('instructions', [])
        
        for instruction in instructions:
            if instruction.get('type') == 'TimelineAddEntries':
                entries = instruction.get('entries', [])
                for entry in entries:
                    entry_content = entry.get('content', {})
                    item_content = entry_content.get('itemContent', {})
                    if item_content.get('itemType') == 'TimelineTweet':
                        tweet_data = item_content.get('tweet_results', {}).get('result', {})
                        core = tweet_data.get('core', {})
                        user_results = core.get('user_results', {}).get('result', {})
                        
                        text = tweet_data.get('legacy', {}).get('full_text', '')
                        media = tweet_data.get('legacy', {}).get('extended_entities', {}).get('media', [])
                        media_urls = [media_item.get('media_url_https') for media_item in media]

                        tweet = {
                            'id': tweet_data.get('rest_id', ''),
                            'text': text,
                            'user': {
                                'name': user_results.get('legacy', {}).get('name', 'Unknown User'),
                                'screen_name': user_results.get('legacy', {}).get('screen_name', 'unknown'),
                                'profile_image_url_https': user_results.get('legacy', {}).get('profile_image_url_https', '')
                            },
                            'media': media_urls
                        }
                        tweets.append(tweet)

    except KeyError as e:
        print(f"KeyError: {e}")

    latest_tweets = tweets[:10]

    return JsonResponse({'tweets': latest_tweets}, safe=False)

@require_http_methods(["GET"])
def fetch_trends(request):
    conn = http.client.HTTPSConnection("twitter-x.p.rapidapi.com")

    headers = {
    'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",
    'x-rapidapi-host': "twitter-x.p.rapidapi.com"
}


    conn.request("GET", "/trends/?woeid=2282863", headers=headers)

    res = conn.getresponse()
    data = res.read()

    try:
        trends = json.loads(data.decode("utf-8"))

        # Directly slice the list if it's not a dictionary
        if isinstance(trends, list):
            top_10_trends = trends[:10]
        else:
            # If it's not a list, return an error
            return JsonResponse({'error': 'Unexpected response format: Not a list'}, status=500)
       
        return JsonResponse({'trends': top_10_trends}, safe=False)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Failed to decode JSON response'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    



@csrf_exempt
def get_ai_description(request):
    import http.client

    conn = http.client.HTTPSConnection("ai-api-photo-description.p.rapidapi.com")

    payload = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"image\"\r\n\r\nBest_Fielders.jpeg\r\n-----011000010111000001101001--\r\n\r\n"

    headers = {
    'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",
    'x-rapidapi-host': "ai-api-photo-description.p.rapidapi.com",
    'Content-Type': "multipart/form-data; boundary=---011000010111000001101001"
}

    conn.request("POST", "/description-from-file", payload, headers)

    res = conn.getresponse()
    data = res.read()


@require_http_methods(["GET"])
def analyze_sentiment(request):
    text = request.GET.get('text', '')
    
    if not text:
        return JsonResponse({'error': 'Text parameter is missing'}, status=400)

    conn = http.client.HTTPSConnection("twinword-sentiment-analysis.p.rapidapi.com")
    
    headers = {
        'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",
        'x-rapidapi-host': "twinword-sentiment-analysis.p.rapidapi.com"
    }

    try:
        query_params = urlencode({'text': text})
        conn.request("GET", f"/analyze/?{query_params}", headers=headers)
        
        res = conn.getresponse()
        data = res.read()
        
        sentiment_data = json.loads(data.decode('utf-8'))
        sentiment_type = sentiment_data.get('type')  # Returns 'positive', 'negative', or 'neutral'
        
        return HttpResponse(sentiment_type)
    
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    finally:
        conn.close()

class TwitterSearchView(View):
    def get(self, request):
        query = request.GET.get('query', '')
        search_type = request.GET.get('type', 'Top')
        
        if not query:
            return JsonResponse({'error': 'Query parameter is required'}, status=400)
        
        # Encode the query and search_type to handle spaces and special characters
        encoded_query = quote(query)
        encoded_search_type = quote(search_type)
        
        conn = http.client.HTTPSConnection("twitter-api47.p.rapidapi.com")
        
        headers = {
            'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",
            'x-rapidapi-host': "twitter-api47.p.rapidapi.com"
        }
        
        endpoint = f"/v2/search?query={encoded_query}&type={encoded_search_type}"
        
        try:
            conn.request("GET", endpoint, headers=headers)
            res = conn.getresponse()
            data = res.read()
            
            if res.status != 200:
                logger.error(f"API returned non-200 status code: {res.status}")
                return JsonResponse({'error': f"API Error: {res.status} {res.reason}"}, status=res.status)
            
            json_data = json.loads(data.decode("utf-8"))
            
            
            tweets = json_data.get('tweets', [])
            cursor = json_data.get('cursor', '')
            
            # Limit to 5 tweets
            limited_tweets = tweets[:10]
            
            # Process tweets to extract necessary information
            processed_tweets = []
            for tweet in limited_tweets:
                processed_tweet = {
                    'id': tweet.get('rest_id'),
                    'text': tweet.get('legacy', {}).get('full_text'),
                    'user': {
                        'name': tweet.get('core', {}).get('user_results', {}).get('result', {}).get('legacy', {}).get('name'),
                        'screen_name': tweet.get('core', {}).get('user_results', {}).get('result', {}).get('legacy', {}).get('screen_name'),
                        'profile_image_url': tweet.get('core', {}).get('user_results', {}).get('result', {}).get('legacy', {}).get('profile_image_url_https')
                    },
                    'retweet_count': tweet.get('legacy', {}).get('retweet_count'),
                    'favorite_count': tweet.get('legacy', {}).get('favorite_count'),
                    'media': tweet.get('legacy', {}).get('extended_entities', {}).get('media', [])
                }
                processed_tweets.append(processed_tweet)
            
            response_data = {
                'tweets': processed_tweets,
                'total_count': len(tweets),
                'displayed_count': len(processed_tweets),
                'cursor': cursor
            }
            
            
            
            return JsonResponse(response_data)
        except http.client.HTTPException as e:
            logger.error(f"HTTP error occurred: {str(e)}")
            return JsonResponse({'error': 'An HTTP error occurred while connecting to the API.'}, status=500)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decoding error: {str(e)}")
            return JsonResponse({'error': 'Unable to parse API response. Please try again later.'}, status=500)
        except Exception as e:
            logger.error(f"Unexpected error in TwitterSearchView: {str(e)}", exc_info=True)
            return JsonResponse({'error': 'An unexpected error occurred. Please try again later.'}, status=500)
        finally:
            conn.close()


@method_decorator(csrf_exempt, name='dispatch')
class TwitterSentimentView(View):
    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()

    def get(self, request):
        query = request.GET.get('query', '')
       

        if not query:
            logger.warning("Received request without query parameter")
            return JsonResponse({'error': 'Query parameter is required'}, status=400)

        try:
            tweets = self.fetch_tweets(query)
            sentiment_counts = self.analyze_sentiment_batch(tweets)

           
            response_data = {
                'sentiment_summary': sentiment_counts,
                'total_analyzed': sum(sentiment_counts.values())
            }
            
            return JsonResponse(response_data, status=200)

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return JsonResponse({'error': f"An unexpected error occurred: {str(e)}"}, status=500)

    def fetch_tweets(self, query):
        encoded_query = quote(query)
        conn = http.client.HTTPSConnection("twitter-api47.p.rapidapi.com")
        headers = {
            'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",
            'x-rapidapi-host': "twitter-api47.p.rapidapi.com"
        }
        endpoint = f"/v2/search?query={encoded_query}&type=Top"

        conn.request("GET", endpoint, headers=headers)
        res = conn.getresponse()
        data = res.read()
        conn.close()

        if res.status != 200:
            raise Exception(f"API Error: {res.status} {res.reason}")

        json_data = json.loads(data.decode("utf-8"))
        return json_data.get('tweets', [])

    def analyze_sentiment_batch(self, tweets):
        sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for tweet in tweets:
            tweet_text = tweet.get('legacy', {}).get('full_text', '')
            sentiment = self.get_sentiment(tweet_text)
            sentiment_counts[sentiment] += 1

        return sentiment_counts

    def get_sentiment(self, text):
        scores = self.sentiment_analyzer.polarity_scores(text)
        if scores['compound'] > 0.05:
            return 'positive'
        elif scores['compound'] < -0.05:
            return 'negative'
        else:
            return 'neutral'
        

class TwitterMediaView(View):
    def get(self, request):
        query = request.GET.get('query', '')
        
        if not query:
            return JsonResponse({'error': 'Query parameter is required'}, status=400)
        
        encoded_query = quote(query)
        
        conn = http.client.HTTPSConnection("twitter-api47.p.rapidapi.com")
        
        headers = {
            'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",
            'x-rapidapi-host': "twitter-api47.p.rapidapi.com"
        }
        
        endpoint = f"/v2/search?query={encoded_query}&type=Top"
        
        try:
            conn.request("GET", endpoint, headers=headers)
            res = conn.getresponse()
            data = res.read()
            
            if res.status != 200:
                return JsonResponse({'error': f"API Error: {res.status} {res.reason}"}, status=res.status)
            
            json_data = json.loads(data.decode("utf-8"))
            
            tweets = json_data.get('tweets', [])
            
            # Process tweets to extract only media information
            media_data = {
                'images': [],
                'videos': []
            }
            
            for tweet in tweets:
                media = tweet.get('legacy', {}).get('extended_entities', {}).get('media', [])
                for item in media:
                    if item['type'] == 'photo':
                        media_data['images'].append({
                            'url': item['media_url_https'],
                            'alt': item.get('ext_alt_text', ''),
                            'user': tweet.get('core', {}).get('user_results', {}).get('result', {}).get('legacy', {}).get('name')
                        })
                    elif item['type'] == 'video':
                        video_url = next((variant['url'] for variant in item['video_info']['variants'] if variant['content_type'] == 'video/mp4'), None)
                        if video_url:
                            media_data['videos'].append({
                                'url': video_url,
                                'thumbnail': item['media_url_https'],
                                'user': tweet.get('core', {}).get('user_results', {}).get('result', {}).get('legacy', {}).get('name')
                            })
            
            return JsonResponse(media_data)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        finally:
            conn.close()        



model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize BLIP model for image captioning
caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)
caption_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")


@csrf_exempt
@require_POST
def analyze_image(request):
    global model, caption_processor, caption_model

    try:
        data = json.loads(request.body)
        image_url = data.get('image_url')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if not image_url:
        return JsonResponse({'error': 'No image URL provided'}, status=400)
    
    if model is None:
        try:
            model = models.mobilenet_v2(pretrained=True).to(device)
            model.eval()
            logger.info("MobileNetV2 model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load MobileNetV2 model: {str(e)}")
            return JsonResponse({'error': 'Image analysis model is not available'}, status=500)

    start_time = time.time()

    try:
        logger.info(f"Analyzing image from URL: {image_url}")

        # Download the image
        response = requests.get(image_url, verify=False)  # Note: verify=False is not recommended for production
        img = Image.open(BytesIO(response.content)).convert('RGB')

        # Calculate image properties
        img_width, img_height = img.size

        # Calculate sharpness using variance of Laplacian
        gray_image = img.convert('L')
        image_array = np.array(gray_image)
        laplacian = cv2.Laplacian(image_array, cv2.CV_64F)
        sharpness = laplacian.var()

        # Define quality based on sharpness
        quality = 'High' if sharpness > 1000 else 'Medium' if sharpness > 500 else 'Low'

        # Preprocess the image for MobileNetV2
        preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        input_tensor = preprocess(img)
        input_batch = input_tensor.unsqueeze(0).to(device)

        # Make predictions with MobileNetV2
        with torch.no_grad():
            output = model(input_batch)

        # The output has unnormalized scores. To get probabilities, run a softmax on it.
        probabilities = torch.nn.functional.softmax(output[0], dim=0)

        # Read the ImageNet class labels
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            imagenet_classes_path = os.path.join(current_dir, 'imagenet_classes.txt')
            with open(imagenet_classes_path) as f:
                categories = [s.strip() for s in f.readlines()]
        except FileNotFoundError:
            logger.error("ImageNet classes file not found. Using placeholder categories.")
            categories = [f"Category_{i}" for i in range(1000)]  # Placeholder categories

        # Get top 3 predictions
        top3_prob, top3_catid = torch.topk(probabilities, 3)
        results = [
            {'label': categories[catid], 'probability': float(prob)}
            for prob, catid in zip(top3_prob, top3_catid)
        ]

        # Generate caption (assuming caption_model and caption_processor are defined elsewhere)
        if caption_model and caption_processor:
            inputs = caption_processor(images=img, return_tensors="pt").to(device)
            outputs = caption_model.generate(**inputs)
            caption = caption_processor.decode(outputs[0], skip_special_tokens=True)
        else:
            caption = "Caption generation not available"

        processing_time = time.time() - start_time

        # Construct the response
        response_data = {
            'results': results,
            'image_width': img_width,
            'image_height': img_height,
            'sharpness': float(sharpness),
            'quality': quality,
            'processing_time': processing_time,
            'caption': caption
        }

        logger.info(f"Analysis complete. Results: {response_data}")
        return JsonResponse(response_data)

    except requests.RequestException as e:
        logger.error(f"Error downloading image: {str(e)}")
        return JsonResponse({'error': f'Failed to download the image: {str(e)}'}, status=500)
    except Exception as e:
        logger.error(f"Error during image analysis: {str(e)}", exc_info=True)
        return JsonResponse({'error': f'An error occurred during image analysis: {str(e)}'}, status=500)