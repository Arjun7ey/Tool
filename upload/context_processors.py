import os
import json
from django.conf import settings

def vite_assets(request):
    try:
        # Look for the manifest file in the STATIC_ROOT directory
        manifest_path = os.path.join(settings.STATIC_ROOT, 'manifest.json')
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r') as manifest_file:
                manifest = json.load(manifest_file)
            
            # Assuming your main entry point is 'src/main.jsx'
            main_entry = manifest.get('src/main.jsx', {})
            return {
                'js_filename': main_entry.get('file', ''),
                'css_filename': main_entry.get('css', [''])[0] if main_entry.get('css') else ''
            }
    except Exception as e:
        print(f"Error in vite_assets context processor: {e}")
    
    # Return empty strings if something goes wrong
    return {
        'js_filename': '',
        'css_filename': ''
    }