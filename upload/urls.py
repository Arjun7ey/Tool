from django.urls import path
from django.urls import re_path
from . import views
from . import consumers
from .views import SignUpView 
from .views import ImageList
from  upload.Views import UserView
from .views import UserRegistrationView, UserLoginView, UserLogoutView , UseradminRegistrationView


urlpatterns = [
   
    
    path('login/', UserView.my_token_obtain_pair, name='login'),
  
]
websocket_urlpatterns = [
    re_path(r'ws/direct/(?P<user_id>\d+)/$', consumers.DirectMessageConsumer.as_asgi()),
]