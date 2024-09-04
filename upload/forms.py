from django import forms
from upload.models import Image
from upload.models import Document
from upload.models import User
from upload.models import Post
from upload.models import Content
from django.contrib.auth.forms import UserCreationForm, UserChangeForm


class ImageUploadForm(forms.ModelForm):
    class Meta:
        model = Image
        fields = ['title', 'image'] 
        
class ImageForm(forms.ModelForm):
    """Form for the image model"""

    class Meta:
        model = Image
        fields = ('title', 'category', 'image')

class DocumentForm(forms.ModelForm):
   # docfile = forms.FileField(
    #    label='Select a file',
     #   help_text='max. 42 megabytes'
    #)
    class Meta:
        model = Document
        fields = ('title', 'category', 'docfile')

class Postform(forms.ModelForm):
     class Meta:
        model = Post
        fields = "__all__"  
        
class CustomUserCreationForm(UserCreationForm):

    class Meta:
        model = User
        fields = ('username', 'password')

class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = User
        fields = ('username', 'password')        

class EventForm(forms.ModelForm):
    class Meta:
        model = Content
        fields = ['title', 'description', 'start_time', 'end_time']
        widgets = {
            'start_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'end_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }        