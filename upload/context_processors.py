import os
import json
from django.conf import settings

def vite_assets(request):
    try:
        manifest_path = os.path.join(settings.BASE_DIR, 'dashboard', 'dist', '.vite', 'manifest.json')
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r') as manifest_file:
                manifest = json.load(manifest_file)
            main_js = manifest.get('src/main.jsx', {}).get('file', '')
            return {
                 'vite_js': 'assets/main-B9Xa0I-Q.js',
              'vite_css': 'assets/main-JrVD0wqw.css',
    }


    except Exception as e:
        print(f"Error in vite_assets context processor: {e}")
    return {'vite_js': '', 'vite_css': ''}