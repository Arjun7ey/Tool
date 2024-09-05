import os
from django.conf import settings

def vite_assets(request):
    dist_dir = os.path.join(settings.BASE_DIR, 'dashboard', 'dist', 'assets')
    js_filename = next((f for f in os.listdir(dist_dir) if f.endswith('.js')), '')
    css_filename = next((f for f in os.listdir(dist_dir) if f.endswith('.css')), '')
    return {
        'js_filename': js_filename,
        'css_filename': css_filename,
    }