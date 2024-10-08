from django.contrib import admin
from django.urls import path, include , re_path
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.generic.base import TemplateView
from upload.Views import ImageView , VideoView, TweetMapView
from upload.Views import DocumentView, TicketViews
from upload.Views import PostView, ChatView, TweetRapidView
from upload.Views import UserView,NotificationView,LinkView,MoMView,SurveyView
from upload.Views import CategoryView, LinkView, SingleContentView
from upload.Views import DepartmentView, SocialMediaView
from upload.Views import ChatbotView
from upload.Views.ImageView import ImageViewSet
from upload.Views.ImageView import ImageDashboardView
from upload.Views.DocumentView import DocumentDashboardView
from upload.Views.PostView import PostDashboardView
from upload.Views.ImageView import ImageStatsAPI    
from upload.Views.UserView import  CustomTokenObtainPairView 
from upload.Views.PostView import PostStatsAPI   
from upload.Views import ModuleView 
from upload.Views.DocumentView import DocumentStatsAPI    
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from upload.Views.ContentView import ContentListCreateAPIView, ContentRetrieveUpdateDestroyAPIView
from upload.Views.EventView import EventListCreateAPIView, EventRetrieveUpdateDestroyAPIView

class CustomTokenObtainPairView(CustomTokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

router = DefaultRouter()
router.register(r'images', ImageViewSet, basename='image')
mom_create = MoMView.MoMCreateViewSet.as_view({
    'post': 'create'
})

urlpatterns =[
   
  # re_path(r'^.*', TemplateView.as_view(template_name='index.html'), name='index'),

   # path('api/', include(router.urls)), 
   path('api/', include('upload.urls')),


    path('api/chatbot/', ChatbotView.chatbot_message, name='chatbot_message'),
    path('api/media-stats/', SingleContentView.MediaStatsView.as_view(), name='media-stats'),
    path('api/media-status/', SingleContentView.media_status_view, name='media-status'),
    path('api/event-media/', SingleContentView.approved_media, name='event_media'),

 
   path('api/search-tweets/', TweetRapidView.search_twitter, name='search_twitter'),
   path('api/fetch-tweet-details/<str:tweet_id>/', TweetRapidView.fetch_tweet_details, name='fetch_tweet_details'),
   path('api/fetch-trends/', TweetRapidView.fetch_trends, name='fetch_trends'),
  #path('api/search-tweets-sentiment/', TweetRapidView.search_twitter_with_sentiment, name='search_tweets_sentiment'),
   path('api/fetch-trends-sentiment/', TweetRapidView.analyze_sentiment, name='fetch_trends_sentiment'),
   path('api/twitter-search/', TweetRapidView.TwitterSearchView.as_view(), name='twitter-search'),
   path('api/twitter-sentiment/', TweetRapidView.TwitterSentimentView.as_view(), name='twitter-sentiment'),

   path('api/twitter-media/', TweetRapidView.TwitterMediaView.as_view(), name='twitter-media'),
   path('api/analyze-image/', TweetRapidView.analyze_image, name='analyze_image'),

   path('api/locations/', TweetMapView.get_locations, name='get_locations'),


   path('api/get-description/', TweetRapidView.get_ai_description, name='get_ai_description'),
  
    path('api/tweets/', TweetRapidView.get_tweet_ids, name='get_tweet_ids'),
   



   # Surveys
    path('api/surveys/create/', SurveyView.CreateSurveyView.as_view(), name='create_survey'),
    path('api/surveys/list/', SurveyView.ListSurveysView.as_view(), name='list_surveys'),
    path('api/surveys/detail/<int:survey_id>/', SurveyView.SurveyDetailView.as_view(), name='survey_detail'),
    path('api/surveys/respond/<int:survey_id>/', SurveyView.SaveResponseView.as_view(), name='save_response'),
  
  
   #Tickets

    path('api/tickets/', TicketViews.TicketListCreate.as_view(), name='ticket-list-create'),
    path('api/tickets/<int:pk>/', TicketViews.TicketRetrieveUpdateDestroy.as_view(), name='ticket-detail'),
    path('api/tickets/<int:pk>/assign/', TicketViews.TicketAssign.as_view(), name='ticket-assign'),
    path('api/tickets/by-status/<str:status>/', TicketViews.TicketListByStatus.as_view(), name='tickets-by-status'),
    path('api/tickets/by-priority/<str:priority>/', TicketViews.TicketListByPriority.as_view(), name='tickets-by-priority'),
    path('api/tickets/assigned-to-me/', TicketViews.TicketAssignedToMe.as_view(), name='tickets-assigned-to-me'),
    path('api/tickets/search/', TicketViews.TicketSearch.as_view(), name='ticket-search'),

 
    path('api/ticket-updates/', TicketViews.TicketUpdateListCreate.as_view(), name='ticket-update-list-create'),
    path('api/ticket-updates/<int:pk>/', TicketViews.TicketUpdateRetrieveUpdateDestroy.as_view(), name='ticket-update-detail'),

  #Modules
    path('api/emaildomainpermissions/', ModuleView.email_domain_permissions_list, name='email_domain_permissions_list'),
    path('api/modules/', ModuleView.module_list, name='module_list'),
    path('api/add-module/', ModuleView.add_module, name='add_module'),
    path('api/remove-module/', ModuleView.remove_module, name='remove_module'),
    path('api/user-modules/', ModuleView.user_modules,name='user_modules'),

   #Links
    path('api/link/dashboard/', LinkView.LinkDashboardView.as_view(), name='link-list'),
    path('api/link/dashboard/upload/', LinkView.LinkUploadView.as_view(), name='link-upload'),
    path('api/link/approve/', LinkView.approve_tasks, name='approve_link_tasks'),
    path('api/link/reject/', LinkView.reject_tasks, name='reject_link_tasks'),
    path('api/link/rate/<int:pk>/', LinkView.LinkRateAPIView.as_view(), name='link-rate'),
    path('api/link/check_unique_image_title/', LinkView.CheckUniqueLinkTitle.as_view(), name='check_unique_link_image_title'),
    path('api/link/<int:link_id>/rate/', LinkView.update_link_rating, name='update_link_rating'),
    path('api/link-stats/', LinkView.LinkStatsAPI.as_view(), name='link_stats'),
    path('api/link/<int:link_id>/status/', LinkView.update_link_status, name='update_link_status'),
    path('api/link/delete/', LinkView.delete_links, name='delete_links'),

    # Paths for Video
    path('api/approved_videos/', VideoView.fetch_approved_videos, name='fetch_approved_videos'),
    path('api/videos/dashboard/', VideoView.VideoDashboardView.as_view(), name='video-dashboard'),
    path('api/videos/dashboard/upload/', VideoView.VideoUploadView.as_view(), name='video-upload'),
    path('api/videos/approve/', VideoView.approve_videos, name='approve_videos'),
    path('api/videos/reject/', VideoView.reject_videos, name='reject_videos'),
    path('api/video/rate/<int:pk>/', VideoView.VideoRateAPIView.as_view(), name='video-rate'),
    path('api/check_unique_video_title/', VideoView.CheckUniqueVideoTitle.as_view(), name='check_unique_video_title'),
    path('api/videos/<int:video_id>/rate/', VideoView.update_video_rating, name='update_video_rating'),
    path('api/video-stats/', VideoView.VideoStatsAPI.as_view(), name='video_stats'),
    path('api/videos/<int:video_id>/status/', VideoView.update_video_status, name='update_video_status'),
    path('api/videos/delete/', VideoView.delete_videos, name='delete_videos'),

    #Images
    path('api/approved_images/', ImageView.fetch_approved_images, name='fetch_approved_images'),
    path('api/images/dashboard/', ImageDashboardView.as_view(), name='image-list'),
    path('api/images/dashboard/upload/', ImageView.ImageUploadView.as_view(), name='image-upload'),
    path('api/images/approve/', ImageView.approve_tasks, name='approve_tasks'),
    path('api/images/reject/', ImageView.reject_tasks, name='reject_tasks'),
    path('api/image/rate/<int:pk>/', ImageView.ImageRateAPIView.as_view(), name='image-rate'),
    path('api/check_unique_image_title/', ImageView.CheckUniqueImageTitle.as_view(), name='check_unique_image_title'),
    path('api/images/<int:image_id>/rate/', ImageView.update_image_rating, name='update_image_rating'),
    path('api/image-stats/', ImageStatsAPI.as_view(), name='image_stats'),
    path('api/images/<int:image_id>/status/', ImageView.update_image_status, name='update_image_status'),
    path('api/images/delete/', ImageView.delete_images, name='delete_images'),
  
    #Documents
    path('api/documents/approve/', DocumentView.approve_documents, name='approve_document'),
    path('api/documents/reject/', DocumentView.reject_documents, name='reject_document'),
    path('api/documents/dashboard/upload/', DocumentView.DocumentUploadView.as_view(), name='document-upload'),
    path('api/documents/rate/<int:pk>/', DocumentView.DocumentRateAPIView.as_view(), name='document-rate'),
    path('api/documents/dashboard/', DocumentDashboardView.as_view(), name='documents-list'),
    path('api/docu-stats/', DocumentStatsAPI.as_view(), name='documents_stats'),
    path('api/documents/delete/', DocumentView.delete_documents, name='delete_document'),
  
    #Posts
    path('api/approved_posts/', PostView.get_approved_posts, name='approved_posts'),
    path('api/posts/<int:pk>/rate/', PostView.PostRateAPIView.as_view(), name='post-rate'),
    path('api/posts/dashboard/', PostDashboardView.as_view(), name='posts-list'), 
    path('api/posts/approve/', PostView.approve_posts, name='approve_post'),
    path('api/posts/reject/', PostView.reject_posts, name='reject_post'),
    path('api/posts/dashboard/upload/', PostView.PostUploadView.as_view(), name='post-upload'),
    path('api/post-stats/', PostStatsAPI.as_view(), name='posts_stats'),
    path('api/posts/delete/', PostView.delete_posts, name='delete_posts'),

    #User 
    path('api/create-new-user/', UserView.CreateNewUser.as_view(), name='create-new-user'),

    path('api/all-users/', UserView.all_user_list, name='all_user_list'),
    path('api/users/', UserView.user_list, name='user_list'),
    path('api/create-users/', UserView.create_user, name='create_user'),
    path('api/delete-users/<int:user_id>/', UserView.DeleteUserView.as_view(), name='delete-user'),
    path('api/user-info/', UserView.UserInfoAPIView.as_view(), name='user-info'),
    path('api/users/<int:pk>/', UserView.UserDetailAPIView.as_view(), name='user-detail'),
 #  path('api/login/', UserView.MyTokenObtainPairView.as_view(), name='login'),
    path('accounts/login/', UserView.LoginView.as_view(), name='login'),  
    path('api/csrf_cookie/', UserView.get_csrf_token, name='get_csrf_token'),
    path('api/user-data/', UserView.get_user_data, name='get-user-data'),
    path('api/update-user/<int:pk>/', UserView.UpdateUserAPIView.as_view(), name='update_user_api'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/',UserView.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', UserView.LogoutView.as_view(), name='logout'),
    path('api/dashboard/data/', UserView.DashboardDataView.as_view(), name='dashboard-data'),
    path('api/dashboard/total-counts/', UserView.TotalCountsAPIView.as_view(), name='total_counts'),
    path('api/users-MoM/',UserView.get_user_list_MoM,name = 'user-list-MoM'),
    path('logout/', UserView.LogoutView.as_view(), name='logout'),
    path('api/user/permissions/', UserView.UserPermissionsView.as_view(), name='loggeninuser-permissions'),
    path('api/users/<int:user_id>/permissions/', UserView.user_permissions_view, name='userwise-permissions'),
    path('api/users/<int:user_id>/permissions/update/', UserView.UserPermissionsUpdateAPIView.as_view(), name='user-permissions-update'),
    path('api/users/<int:id>/update-details/', UserView.update_user_details, name='update_user_details'),
    path('api/users/<int:id>/upload-profile-picture/', UserView.UploadProfilePictureView.as_view(), name='upload-profile-picture'),



    #Departments
    path('api/departments/', DepartmentView.departments_api, name='departments_api'),
    path('api/department-userwise/', DepartmentView.departments_list_user_wise, name='departments_api_userwise'),
    path('api/add-departments/', DepartmentView.add_department, name='add-department'),
    path('api/departments-divisions-subdivisions/', DepartmentView.departments_divisions_subdivisions_list_user_wise, name='departments_divisions_subdivisions_list_user_wise'),
    #MoMs
    path('api/generate-mom', MoMView.generate_mom, name='generate_mom'),
    path('api/mom-create/', mom_create, name='mom-create'),
    path('api/moms/', MoMView.MoMViewSet.as_view({'get': 'list', 'post': 'create'}), name='mom-list'),
    path('api/momrows/<int:pk>/update/', MoMView.MoMRowUpdateView.as_view(), name='mom-update'),
    
    #Content/Event
    path('api/contents/', ContentListCreateAPIView.as_view(), name='content-list-create'),
    path('api/content/<int:pk>/', ContentRetrieveUpdateDestroyAPIView.as_view(), name='content-detail'),
    path('api/events/', EventListCreateAPIView.as_view(), name='onlyevent-list-create'),
    path('api/events-list/<int:pk>/', EventRetrieveUpdateDestroyAPIView.as_view(), name='onlyevent-detail'),  

    #Survey
   # path('api/surveys/', SurveyView.SurveyListCreateAPIView.as_view(), name='survey-list'),
  #  path('api/surveys/<int:pk>/', SurveyView.SurveyRetrieveUpdateDestroyAPIView.as_view(), name='survey-detail'),
   # path('api/surveys/create-with-questions/', SurveyView.SurveyCreateWithQuestionsAPIView.as_view(), name='survey-create-with-questions'),
   # path('api/surveys/<int:survey_id>/questions/', SurveyView.QuestionListCreateAPIView.as_view(), name='question-list-create'),
   # path('api/questions/<int:pk>/', SurveyView.QuestionRetrieveUpdateDestroyAPIView.as_view(), name='question-detail'),
     
    #Categories
    path('api/categories/',CategoryView.CategoryListView.as_view(), name='category-list'),
    path('api/categories/<int:pk>/', CategoryView.CategoryDetailView.as_view(), name='category-detail'),
 
    #Notification   
      
    path('api/notifications/', NotificationView.NotificationListView.as_view(), name='notification-list'),
    path('api/notifications/dashboard/', NotificationView.NotificationListDashboardView.as_view(), name='notification-list'),
    path('api/notifications/mark-all-read/', NotificationView.mark_notifications_as_read, name='mark-notifications-as-read'),
    
    #Twitter
    path('api/twitter/login/', SocialMediaView.twitter_login, name='twitter_login'),
    path('api/twitter/callback/', SocialMediaView.twitter_callback, name='twitter_callback'),
    #path('api/post_to_twitter/', SocialMediaView.post_to_twitter, name='post_to_twitter'),
    path('api/check_authentication/', SocialMediaView.check_authentication, name='check_authentication'),
    #path('api/get_tweet_engagement/', SocialMediaView.get_tweet_engagement, name='get_tweet_engagement'),
   #  path('api/tweet/engagements/', SMAnalysisView.fetch_engagement_data, name='get_engagement_data_from_twitter'),
    #path('api/tweet/<int:tweet_id>/engagements/', SMAnalysisView.fetch_engagement_data, name='get_engagement_data_from_twitter'),
   # path('api/get_saved_tweets/', SMAnalysisView.get_saved_tweets, name='get_tweet_data'),
    #Othersapi/get_saved_tweets
    path('api/post_text_to_twitter/', SocialMediaView.post_text_to_twitter, name='post_text_to_twitter'),
    path('api/post_text_with_media_to_twitter/', SocialMediaView.post_text_with_media_to_twitter, name='post_text_with_media_to_twitter'),
 
  # path('api/instagram/authorize/', InstagramView.InstagramAuthView.as_view(), name='instagram_authorize'),
   # path('api/instagram/callback/',InstagramView.InstagramCallbackView.as_view(), name='instagram_callback'),
   


   # path('tweet/<int:tweet_id>/', SMAnalysisView.get_tweet_data, name='get_tweet_data'),

    path('api/messages/<int:conversation_id>/', ChatView.MessageListView.as_view(), name='message_list'),
    path('api/send-message/', ChatView.SendMessageView.as_view(), name='send_message'),
    path('api/unread-counts/', ChatView.UnreadCountView.as_view(), name='unread_counts'),
    path('api/mark-read/<int:recipient_id>/', ChatView.MarkMessagesAsReadView.as_view(), name='mark_messages_as_read'),
    path('api/delete-message/<int:message_id>/', ChatView.DeleteMessageView.as_view(), name='delete_message'),
    path('api/create-or-fetch-conversation/', ChatView.CreateOrFetchConversationView.as_view(), name='create_or_fetch_conversation'),




    path('admin/', admin.site.urls),

   # path('api/auth/register/', UseradminRegistrationView.as_view(), name='user-registration'),
   
   # path('',include('upload.urls')),
    
  
   


]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)