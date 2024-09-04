"""
Django settings for Tool project.

Generated by 'django-admin startproject' using Django 5.0.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
from datetime import timedelta 
from datetime import datetime
import os
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
#BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-_*oiwy*))jpc80c)+##dskt6kqb))5r*sk&#f#dd)!jjg%zo=!'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['127.0.0.1', 'localhost','eybuzz-ggdwdvafa0gcc0hy.centralindia-01.azurewebsites.net']



SECURE_SSL_REDIRECT = True
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'upload',
    'rest_framework',
    'rest_framework_simplejwt',
     'rest_framework_jwt',  
    'rest_framework.authtoken',
    'corsheaders',
    'sslserver',
    'django_extensions',
    'channels',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
   
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
]

ROOT_URLCONF = 'Tool.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        #'DIRS': [BASE_DIR /  "templates"],
        #'DIRS': [BASE_DIR / 'smtreact/build'],
        'DIRS': [os.path.join(BASE_DIR, 'smtreact/build'),
                os.path.join(BASE_DIR, "templates") ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Tool.wsgi.application'

AUTHENTICATION_BACKENDS = (
  
    'django.contrib.auth.backends.ModelBackend',
)
# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'smtdb',
        'USER': 'postgres',
        'PASSWORD': 'db@123',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
} 
SESSION_COOKIE_HTTPONLY = True  # Prevent client-side JavaScript access
SESSION_COOKIE_SAMESITE = 'Lax'  # Adjust based on your needs

SESSION_COOKIE_AGE = 7 * 24 * 60 * 60  # 7 days in seconds

# Keep the session active even if the browser is closed
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'smtreact/build/static'),
    # Other directories if needed
]



# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

CORS_ORIGIN_WHITELIST = [
    'http://localhost:3000', 
     'http://localhost:5173', # Add your frontend URL here
    # Add more URLs as needed
]
# Optional: Allow all methods and headers for simplicity in development
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_ALLOW_HEADERS = [  'content-type',
    'x-csrftoken',
    'authorization',]

   

# Add the path to the React build directory
STATICFILES_DIRS = [
   # os.path.join(BASE_DIR, 'smtreact/build/static'),
  
   BASE_DIR / 'upload/static',
   # BASE_DIR / 'smtreact/build',  # Include this to serve the manifest.json and other root files
]

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'upload.User'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
      
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],  }
   

# For JWT settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # Token expiration time
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': 'your-secret-key',  # Replace with your own secret key
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    # Add more options as needed
}

SESSION_COOKIE_AGE = 3600  # Session expiry time in seconds (e.g., 1 hour)
SESSION_COOKIE_SECURE = True  # Set to True for HTTPS-only cookies

LOGIN_REDIRECT_URL = "home"
LOGOUT_REDIRECT_URL = "user_logout"

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',  # Add your frontend URL here
]
CORS_ALLOW_CREDENTIALS = True

TWITTER_API = {
    'CONSUMER_KEY': 'VPMDvfn7A9rwpT3d5QBTcWXqL',
    'CONSUMER_SECRET': 'CN3hNF4csVPEc5LSMxyysUTRlbcdL44e0rdTILlfz3OXhdTHt6',
    'ACCESS_TOKEN': '1816341460905779200-JocZb5Lt5JCnGCKcO6XzpZqNgxFRh0',
    'ACCESS_TOKEN_SECRET': 'oMsDUbr9HLMaxYYPweGx61fi36X31HQY1L4e2qQgLiVFB',
    'BEARER_TOKEN': 'AAAAAAAAAAAAAAAAAAAAAOEWvAEAAAAAoTBMWdW%2BYtdpH7%2BVale9oCoArjI%3DMLxFy0FX0b2Dg2wy6GauAoZ5c9SvE1bpb8mqR3kgPhQwowqhVJ'
}
INSTAGRAM_APP_ID = '362786126659721'
INSTAGRAM_APP_SECRET = '66ddd19366a13d9b359e2854d668902b'
INSTAGRAM_REDIRECT_URI = 'https://localhost:8000/api/instagram/callback/'

SESSION_ENGINE = 'django.contrib.sessions.backends.db'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

INSTAGRAM_USERNAME = 'smtdemoteam'
INSTAGRAM_PASSWORD = 'Delhi@dot'
EDGE_DRIVER_PATH = r"C:\Users\XY262ED\OneDrive - EY\Desktop\Software\msedgedriver.exe"

ASGI_APPLICATION = 'Tool.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',  # Use Redis for production
    },
}


