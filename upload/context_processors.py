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
                'vite_js': f'assets/{main_js}' if main_js else '',
                'vite_css': '',  # Vite might be injecting CSS via JS, so there might not be a separate CSS file
            }
    except Exception as e:
        print(f"Error in vite_assets context processor: {e}")
    return {'vite_js': '', 'vite_css': ''}