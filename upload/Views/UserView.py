from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from upload.models import Image
from rest_framework.exceptions import ValidationError
from upload.models import Document
from upload.models import User 
from upload.Serializers.UserSerializer import UserSerializer
from upload.Serializers.UserSerializer import UseradminSerializer
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.urls import reverse_lazy
from django.shortcuts import render,redirect, get_object_or_404
from upload.models import Post
from django.contrib.auth.models import Permission
#from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, get_object_or_404, redirect    
from django.contrib.auth.decorators import login_required
from upload.models import Department
from django.db.models import Q
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView
from upload.Serializers.UserSerializer import CustomTokenRefreshSerializer
from django.middleware.csrf import get_token
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from upload.serializers import CustomTokenObtainPairSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from django.middleware.csrf import get_token
from rest_framework.permissions import IsAuthenticated
from rest_framework import views, status
from upload.Serializers.UserSerializer import UserInfoSerializer, UserPermissionsSerializer,AllUserSerializer
from upload.Serializers.UserSerializer import CreateUserSerializer, UserPermissionsUpdateSerializer
from upload.serializers import MyTokenObtainPairSerializer
import logging
from upload.Serializers.UserSerializer import UserNewSerializer
from upload.Serializers.UserSerializer import UserPicSerializer
from django.views.decorators.http import require_http_methods
from rest_framework import generics
from django.core.exceptions import PermissionDenied
from rest_framework import status
from rest_framework.parsers import JSONParser
from django.contrib.auth import logout as django_logout



class CreateNewUser(APIView):

    def post(self, request, *args, **kwargs):
        print(request.data)
        serializer = UserNewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UploadProfilePictureView(APIView):
    def post(self, request, id):
        try:
            user = User.objects.get(pk=id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserPicSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PATCH'])
def update_user_details(request, id):
    try:
        
        if request.user.id != int(id):
            return Response({'detail': 'Not authorized to update this user.'}, status=status.HTTP_403_FORBIDDEN)
        
        user = User.objects.get(pk=id)
        serializer = UserSerializer(user, data=request.data, partial=True)  # Partial update

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_user_list(request):
    users = User.objects.all()
    serializer = AllUserSerializer(users, many=True)
    return Response(serializer.data)


class UserPermissionsUpdateAPIView(APIView):
    def patch(self, request, user_id, format=None):
        try:
            
            user = User.objects.get(id=user_id)
            print(request.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserPermissionsUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(user, serializer.validated_data)
            return Response({'status': 'Permissions updated'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class UserDetailAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET'])
def user_permissions_view(request, user_id):
    try:
        user = User.objects.get(id=user_id)
       
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
   
    permissions = {
        'Can Upload Image': user.has_perm('upload.can_add_image'),
        'Can Upload Document': user.has_perm('upload.can_add_document'),
        'Can Post': user.has_perm('upload.can_add_post'),
        'Can Upload Video': user.has_perm('upload.can_add_video'),
    }
    
    
    return JsonResponse(permissions)

class UserPermissionsView(generics.RetrieveAPIView):
    serializer_class = UserPermissionsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user 



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_list_MoM(request):
    users = User.objects.all()
    user_list = [{'id': user.id, 'username': user.username, 'full_name': f"{user.first_name} {user.last_name}"} for user in users]
    return Response(user_list)





class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        django_logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)




class TotalCountsAPIView(APIView):
    def get(self, request, format=None):
        total_images = Image.objects.count()
        total_documents = Document.objects.count()
        total_posts = Post.objects.count()
        
        data = {
            'total_images': total_images,
            'total_documents': total_documents,
            'total_posts': total_posts,
        }
        
        return Response(data)



class DashboardDataView(APIView):
    def get(self, request, format=None):
        # Count pending, approved, and rejected data for images
        pending_images_count = Image.objects.filter(status='Pending').count()
        approved_images_count = Image.objects.filter(status='Approved').count()
        rejected_images_count = Image.objects.filter(status='Rejected').count()
        
        # Count pending, approved, and rejected data for documents
        pending_documents_count = Document.objects.filter(status='Pending').count()
        approved_documents_count = Document.objects.filter(status='Approved').count()
        rejected_documents_count = Document.objects.filter(status='Rejected').count()
        
        # Count pending, approved, and rejected data for posts
        pending_posts_count = Post.objects.filter(status='Pending').count()
        approved_posts_count = Post.objects.filter(status='Approved').count()
        rejected_posts_count = Post.objects.filter(status='Rejected').count()
        
        # Construct the data response
        data = {
            'pending': {
                'images': pending_images_count,
                'documents': pending_documents_count,
                'posts': pending_posts_count,
            },
            'approved': {
                'images': approved_images_count,
                'documents': approved_documents_count,
                'posts': approved_posts_count,
            },
            'rejected': {
                'images': rejected_images_count,
                'documents': rejected_documents_count,
                'posts': rejected_posts_count,
            }
        }
        
        return Response(data)


 
class UpdateUserAPIView(APIView):
    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)

            department_ids = request.data.pop('department_ids', None)
            department_id = request.data.pop('department_id', None)

            if department_ids is not None:
                if not isinstance(department_ids, list):
                    department_ids = [department_ids]
            elif department_id is not None:
                department_ids = [department_id]
            
            # Create or update the serializer
            serializer = UserSerializer(user, data=request.data, partial=True)
            
            if 'password' in request.data:
                del request.data['password']
            
            if serializer.is_valid():
                # Save the user data
                serializer.save()
                
                # Update user departments
                if department_ids is not None:
                    departments = Department.objects.filter(id__in=department_ids)
                    user.departments.set(departments)
                
                # Prepare the response with department names
                user_data = serializer.data
                user_data['department_names'] = [dept.name for dept in user.departments.all()]

                return Response(user_data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    user = request.user
    role = user.role if user else 'User'
    username = user.username if user else ''
    full_name = f"{user.first_name} {user.last_name}" if user else ''
    departments = user.departments.all() if user else []
    user_id = user.id
    email=user.email
    phone_number = user.phone_number if user else ''  # Add phone number
    
    # Convert departments queryset to a list of dictionaries with id and name
    department_list = [{'id': department.id, 'name': department.name} for department in departments]
    
    # Get the profile picture URL if it exists
    profile_picture_url = user.profile_picture.url if user.profile_picture else None

    return Response({
        'userRole': role,
        'username': username,
        'fullName': full_name,
        'email':email,
        'userId': user_id,
        'phoneNumber': phone_number,  # Include phone number in the response
        'departments': department_list,  # List of dictionaries with id and name
        'profilePicture': profile_picture_url  # URL of the profile picture
    })

@ensure_csrf_cookie
def get_csrf_token(request):
    """
    View to get CSRF token.
    """
    csrf_token = get_token(request)  # Get the CSRF token
    return JsonResponse({'csrftoken': csrf_token})

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@method_decorator(ensure_csrf_cookie, name='dispatch')
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
       

        # Modify the request data to include 'username'
        data = request.data.copy()
        data['username'] = data.get('email')

        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            # Retrieve both access and refresh tokens
            access_token = serializer.validated_data.get('access')
            refresh_token = serializer.validated_data.get('refresh')
           
            # Return both tokens in the response
            return Response({
                'access': str(access_token),
               'refresh': str(refresh_token)
            }, status=status.HTTP_200_OK)
        print("Validation failed with errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class CustomTokenRefreshView(BaseTokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            access_token = serializer.validated_data.get('access')
            refresh_token = serializer.validated_data.get('refresh')
            print("Token refresh successful.")
            return Response({
                'access': str(access_token),
                'refresh': str(refresh_token)
            }, status=status.HTTP_200_OK)
        print("Validation failed with errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(CustomTokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)    

class UserInfoView(APIView):
    

    def get(self, request):
        data = {
            'username': request.user.username,
            'is_superuser': request.user.is_superuser,
            'department': request.user.profile.department if hasattr(request.user, 'profile') else None,
        }
        return Response(data, status=status.HTTP_200_OK)




logger = logging.getLogger(__name__)

class UserInfoAPIView(views.APIView):
    serializer_class = UserInfoSerializer

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            data = {
                'is_superuser': user.is_superuser,
                'department': user.department.name if user.department else None,
            }
            serializer = self.serializer_class(data=data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        else:
            logger.error('User is not authenticated.')
            return Response({'error': 'User is not authenticated.'}, status=status.HTTP_401_UNAUTHORIZED)

class DeleteUserView(APIView):
    def delete(self, request, user_id, *args, **kwargs):
        try:
            # Attempt to retrieve and delete the user with the given ID
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Handle the case where the user with the given ID does not exist
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        

@csrf_exempt
@api_view(['POST'])
def create_user(request):
    # Extract the data
    data = request.data
    print("Received data:", data)
    
    department_names = request.data.getlist('department_names', [])
    user_role = request.data.get('role')

    # Use a serializer to validate and save the user
    serializer = CreateUserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Add existing departments to the user
        for department_name in department_names:
            try:
                department = Department.objects.get(name=department_name)
                user.departments.add(department)
            except Department.DoesNotExist:
                print(f"Department with name '{department_name}' does not exist.")
        
        # Set permissions based on role
        if user_role == 'user':
            permissions = [
                'can_add_image',
                'can_add_document',
                'can_add_post',
                'can_add_video'
            ]
            for perm in permissions:
                try:
                    permission = Permission.objects.get(codename=perm)
                    user.user_permissions.add(permission)
                except Permission.DoesNotExist:
                    print(f"Permission with codename '{perm}' does not exist.")
        else:
            # Remove permissions if not user role
            permissions = [
                'can_add_image',
                'can_add_document',
                'can_add_post',
                'can_add_video'
            ]
            for perm in permissions:
                try:
                    permission = Permission.objects.get(codename=perm)
                    user.user_permissions.remove(permission)
                except Permission.DoesNotExist:
                    print(f"Permission with codename '{perm}' does not exist.")
        
        user.save()

        # Prepare the response data
        response_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user_role,
            'phoneNumber': user.phone_number,
            'department_names': department_names,
            'permissions': [perm.codename for perm in user.user_permissions.all()],
            'profile_picture': user.profile_picture.url if user.profile_picture else None
        }

        return Response(response_data, status=status.HTTP_201_CREATED)
    print(serializer.errors)
    # Raise a custom validation error if username already exists
    if 'username' in serializer.errors:
        raise ValidationError({'username': 'Username already taken.'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_list(request):
    # Get users based on the role of the request user
    users = User.objects.for_user(request.user)
    
    # Further filter users if the role is departmentadmin or user
    if request.user.role in ['departmentadmin', 'divisionadmin']:
        users = users.filter(Q(role='divisionadmin') | Q(role='subdivisionuser'))
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def login_view(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            jwt_token = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }

            return Response({'message': 'Login successful', 'token': jwt_token})
        else:
            return Response({'error': 'Invalid credentials'}, status=401)
    else:
        return Response({'error': 'Method not allowed'}, status=405)    
    
@api_view(['POST'])
def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logout successful'})

    

            



def removepermission(request):
    codename = "add_image"
    user = User.objects.get(username='arjun')
    
   
    try:
        permission = Permission.objects.get(codename=codename)
    except Permission.DoesNotExist:
        return HttpResponse(f"Permission '{codename}' does not exist.", status=404)
    
    
    user.user_permissions.remove(permission)
    
    return HttpResponse(f"Permission '{codename}' removed from user '{user.username}'.")








class UserLoginView(ObtainAuthToken):
   
    def POST(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            if created:
                token.delete()  # Delete the token if it was already created
                token = Token.objects.create(user=user)
            response_data = {
                'token': token.key,
                'username': user.username,
                'role': user.role,
            }

            if user.role == 'useradmin':
                useradmin = user.useradmin_account  
                if useradmin is not None:
                   
                    useradmin_data = UseradminSerializer(useradmin).data
                    response_data['data'] = useradmin_data

            return Response(response_data)
        else:
            return Response({'message': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(request.headers) 
        token_key = request.auth.key
        token = Token.objects.get(key=token_key)
        token.delete()

        return Response({'detail': 'Successfully logged out.'})
    
 