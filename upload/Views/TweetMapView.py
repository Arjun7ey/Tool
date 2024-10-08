import http.client
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from geopy.geocoders import Nominatim

# Initialize geocoder
geolocator = Nominatim(user_agent="myGeocoder")

@csrf_exempt
def get_locations(request):
    # Define the Twitter API connection
    conn = http.client.HTTPSConnection("twitter-aio.p.rapidapi.com")
    headers = {
        'x-rapidapi-key': "a84d0adc58msh7547906bd5ad3a9p145f4ajsn5d7d4f8af91b",  # Store your API key in Django settings
        'x-rapidapi-host': "twitter-aio.p.rapidapi.com"
    }
    
    # Make the request to the Twitter API
    conn.request("GET", "/user/44196397/followings/basic?username=DoT_India", headers=headers)
    res = conn.getresponse()
    data = res.read().decode("utf-8")
    
    # Parse the data
    try:
        user_data = json.loads(data)
        followings = user_data.get('followings', [])  # Access the 'followings' key
    except json.JSONDecodeError as e:
        return JsonResponse({'error': 'Failed to parse JSON response'}, status=500)
    
    # Extract and geocode locations
    location_data = []
    for user in followings:
        location = user.get('location')
        if location:
            try:
                geo_info = geolocator.geocode(location)
                if geo_info:
                    location_data.append({
                        'user': user.get('name'),
                        'location': location,
                        'latitude': geo_info.latitude,
                        'longitude': geo_info.longitude
                    })
            except Exception as e:
                print(f"Geocoding error for location '{location}': {e}")
    
    return JsonResponse({'locations': location_data}, safe=False)
