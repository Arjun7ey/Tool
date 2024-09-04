from django.http import JsonResponse
from upload.models import Tweet, Image
from django.views.decorators.http import require_http_methods
import requests
from urllib.parse import urlencode
import json
import os
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import re
from django.core.files.storage import default_storage
import http.client
import urllib.parse

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
    conn = http.client.HTTPSConnection("twitter-aio.p.rapidapi.com")

    headers = {
        'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",
        'x-rapidapi-host': "twitter-aio.p.rapidapi.com"
    }

    conn.request("GET", "/trends/2282863", headers=headers)
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
       
        return JsonResponse(sentiment_data)
    
    except http.client.HTTPException as e:
        return JsonResponse({'error': f'HTTP request failed: {str(e)}'}, status=500)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Failed to decode API response'}, status=500)
    finally:
        conn.close()