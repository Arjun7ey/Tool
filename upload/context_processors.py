import json
from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage

def vite_assets(request):
    try:
        with open(staticfiles_storage.path('staticfiles.json'), 'r') as f:
            manifest = json.load(f)
        
        # Find the main JS file (assuming it starts with 'main' and ends with '.js')
        js_file = next((v for k, v in manifest['paths'].items() if k.startswith('assets/main') and k.endswith('.js')), '')
        
        # Find the main CSS file (assuming it starts with 'main' and ends with '.css')
        css_file = next((v for k, v in manifest['paths'].items() if k.startswith('assets/main') and k.endswith('.css')), '')
        
        return {
            'vite_js': js_file,
            'vite_css': css_file
        }
    except Exception as e:
        print(f"Error in vite_assets context processor: {e}")
        return {'vite_js': '', 'vite_css': ''}