from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Image
from .models import Document
from upload.Serializers.ImageSerializer import ImageSerializer
from upload.forms import ImageForm
from upload.forms import DocumentForm
from .models import User 
from upload.Serializers.UserSerializer import UserSerializer,UseradminSerializer
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from .forms import CustomUserCreationForm
from django.shortcuts import render,redirect, get_object_or_404
from django.contrib import messages
from .models import Post
from .forms import Postform
from django.contrib.auth.models import Permission
#from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, get_object_or_404, redirect    
from django.contrib.auth.decorators import login_required
from .models import Content
from .forms import EventForm
from datetime import datetime
from django.http import JsonResponse


def event_list_json(request):
    events = Content.objects.filter(created_by=request.user)
    event_list = []
    for event in events:
        event_list.append({
            'title': event.title,
            'start': event.start_time.isoformat(),
            'end': event.end_time.isoformat(),
        })
    return JsonResponse(event_list, safe=False)

@login_required
def event_list(request):
    events = Content.objects.filter(created_by=request.user).order_by('start_time')
    return render(request, 'event_list.html', {'events': events})

@login_required
def event_detail(request, event_id):
    event = get_object_or_404(Content, id=event_id)
    return render(request, 'event_detail.html', {'event': event})

@login_required
def event_create(request):
    if request.method == 'POST':
        form = EventForm(request.POST)
        if form.is_valid():
            event = form.save(commit=False)
            event.created_by = request.user
            event.save()
            return redirect('event_list')
    else:
        form = EventForm()
    return render(request, 'event_form.html', {'form': form})

@login_required
def event_edit(request, event_id):
    event = get_object_or_404(Content, id=event_id)
    if request.method == 'POST':
        form = EventForm(request.POST, instance=event)
        if form.is_valid():
            form.save()
            return redirect('event_list')
    else:
        form = EventForm(instance=event)
    return render(request, 'event_form.html', {'form': form})


def userlist(request):
    users = User.objects.all()
    return render(request, 'user_list.html', {'users': users})

def removepermission(request):
    codename = "add_image"
    user = User.objects.get(username='arjun')
    
    # Get the permission
    try:
        permission = Permission.objects.get(codename=codename)
    except Permission.DoesNotExist:
        return HttpResponse(f"Permission '{codename}' does not exist.", status=404)
    
    # Remove the permission from the user
    user.user_permissions.remove(permission)
    
    return HttpResponse(f"Permission '{codename}' removed from user '{user.username}'.")


def register_page(request):
    # Check if the HTTP request method is POST (form submission)
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        role= request.POST.get('role')
        password = request.POST.get('password')
         
        # Check if a user with the provided username/email already exists

        user = User.objects.filter(username=username)
         
        if user.exists():
            # Display an information message if the username is taken
            messages.info(request, "Username already taken!")
            return redirect('/register/')
        
        user = User.objects.filter(email=email)
         
        if user.exists():
            # Display an information message if the username is taken
            messages.info(request, "Email already taken!")
            return redirect('/register/')
        
      
         
        # Create a new User object with the provided information
        user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            username=username,
            email=email,
            role=role,
        )
         
        # Set the user's password and save the user object
        user.set_password(password)
        user.save()
         
        # Display an information message indicating successful account creation
        messages.info(request, "Account created Successfully!")
        return redirect('/register/')
     
    # Render the registration page template (GET request)
    return render(request, 'register.html')

class ImageList(APIView):
    def post(self, request):
        serializer= ImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        images= Image.objects.all()
        serializer= ImageSerializer(images,many=True)
        return Response(serializer.data)

def create_post(request):
     if request.method == 'GET':
        context = {'form': Postform()}
        return render(request, 'post_form.html', context)
     elif request.method == 'POST':
        form = Postform(request.POST)
        if form.is_valid():
            form.save()
            return redirect('homepost')
        else:
            return render(request, 'post_form.html', {'form': form})

def posthome(request):
    if request.user.username == 'admin':
     posts = Post.objects.all()
     context = {'posts': posts}
     return render(request, 'displaydatapost.html', context)
    else :
      postuser = Post.objects.all()
      context = {'postuser': postuser}
      return render(request, 'displaydatapost.html', context)



def about(request):
    return render(request, 'about.html')

@api_view(('GET',))
def imagehome(request):
     if request.user.username == 'admin':
        c = Image.objects.all()
        c_serializer = ImageSerializer(c,many=True)
        return render(request, 'displaydata.html', {'c': c_serializer.data})
       # return Response(c_serializer.data)
     else:  
        #user = User.objects.get(username='arjun')
    
        #permission = Permission.objects.get(codename='add_image')  
        #user.user_permissions.remove(permission)
        c = Image.objects.filter(user=request.user)
        #c= request.user.Image
        c_serializer = ImageSerializer(c,many=True)
        return render(request, 'displaydata.html', {'c': c})
        #return Response(c_serializer.data)

def documentsHome(request):
    if request.user.username == 'admin':
        c = Document.objects.all()
        return render(request, 'displaydatadocu.html', {'c': c})
    else:  
        c = Document.objects.filter(user=request.user)
        return render(request, 'displaydatadocu.html', {'c': c})
    
def changestatus(request):
    Image.objects.filter(id=request.POST['postID']).update(status=request.POST['select'])
    return HttpResponseRedirect(reverse_lazy('viewhome'))  

def changestatusdocu(request):
    Document.objects.filter(id=request.POST['postID']).update(status=request.POST['select'])
    return HttpResponseRedirect(reverse_lazy('viewhomedocuments'))  
        
def displaystatus(request):
    stat=request.POST.get('status')
    if request.user.username == 'admin':
        c = Image.objects.filter(status=stat)
        return render(request, 'displaystatus.html', {'c': c})
    else:  
        
        d= Image.objects.filter(status=stat,user=request.user)
        return render(request, 'displaystatus.html', {'d': d})
    
def displaystatusdocu(request):
     stat=request.POST.get('status')
     if request.user.username == 'admin':
        c = Document.objects.filter(status=stat)
        return render(request, 'displaystatusdocu.html', {'c': c})
     else:  
        d= Document.objects.filter(status=stat,user=request.user)
        return render(request, 'displaystatusdocu.html', {'d': d})
        

def imagepost(request):
    """Process images uploaded by users"""
   # user = User.objects.get(username='arjun')
    if request.user.has_perm("add_image"):
 
        
     if request.method == 'POST':
        
        form = ImageForm(request.POST, request.FILES)
        if form.is_valid():
            form.instance.user = request.user
            print(form.instance.user)
            form.save()
            my_data = Image.objects.all()
            
            # Get the current instance object to display in the template
            img_obj = form.instance
            return render(request, 'imagepost.html', {'form': form, 'img_obj': img_obj, 'my_data': my_data})
     else:
        form = ImageForm()
        return render(request, 'imagepost.html', {'form': form})
    else:
         return HttpResponse(f"User '{request.user.username}' does not have permission ")


def documentpost(request):
    """Process images uploaded by users"""
    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
           #docu_obj = Document(docfile = request.FILES['docfile'])
           #docu_obj.save()
           #my_data = Document.objects.all()
            # Get the current instance object to display in the template
           form.instance.user = request.user
           form.save()
           my_data = Document.objects.all()
            # Get the current instance object to display in the template
           docu_obj = form.instance
        return render(request, 'documentpost.html', {'form': form, 'docu_obj': docu_obj, 'my_data': my_data})
    else:
        form = DocumentForm()
    return render(request, 'documentpost.html', {'form': form})

def edit_post(request, id):
    post = get_object_or_404(Post, id=id)
    if request.method == 'GET':
        context = {'form': Postform(instance=post), 'id': id}
        return render(request,'post_form.html',context)
    
    elif request.method == 'POST':
        form = Postform(request.POST, instance=post)
        if form.is_valid():
            form.save()
            messages.success(request, 'The post has been updated successfully.')
            return redirect('homepost')
        else:
            messages.error(request, 'Please correct the following errors:')
            return render(request,'displaydatapost.html',{'form':form})

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UseradminRegistrationView(APIView):
    def post(self, request):
        serializer = UseradminSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
                useradmin = user.useradmin_account  # Assuming the related name is "useradmin_account"
                if useradmin is not None:
                    # Add student data to the response data
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
    
class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"    


def index(request):
    return render(request, 'index.html')    