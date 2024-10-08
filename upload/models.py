from django.db import models
from django.contrib.auth.models import AbstractUser , BaseUserManager 
from django.conf import settings
from rest_framework.authtoken.models import Token
import datetime
import os
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _




class MoM(models.Model):
    
    sn_number = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "MoMs"

    def __str__(self):
        return self.title

class MoMRow(models.Model):
    mom = models.ForeignKey(MoM, related_name='rows', on_delete=models.CASCADE)
    sn_number = models.CharField(max_length=100, unique=True)  # Unique within the MoM instance
    discussion_points = models.TextField(blank=True)  # Detailed description of each discussion point (optional)
    discussion_lead = models.CharField(max_length=255, blank=True)  # The person who led the discussion (optional)
    contributors = models.TextField(blank=True)  # Names of participants who contributed to the discussion (optional)
    tentative_dates = models.TextField(blank=True)  # Proposed dates related to the discussion point (optional)
    decision_taken = models.TextField(blank=True)  # Summary of decisions made regarding the discussion point (optional)
    action_items = models.TextField(blank=True)  # Specific tasks or actions resulting from the discussion (required)
    responsible_person = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Individual or team responsible for each action item (required)
    status = models.CharField(max_length=50, blank=True)  # Current status of each discussion point or action item (optional)
    comments_notes = models.TextField(blank=True)  # Additional remarks or context (optional)
    priority_level = models.CharField(max_length=50, blank=True)  # Importance or urgency of the discussion point or action item (optional)
    impact = models.TextField(blank=True)  # Potential impact or significance of the discussion point (optional)
    follow_up_required = models.BooleanField(default=False,blank=True)  # Whether further discussion or action is needed (optional)
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, blank=True)  # Default to 0, optional
    class Meta:
        verbose_name_plural = "MoM Rows"
        unique_together = ['mom', 'sn_number']  # Ensures unique sn_number within each MoM

    def __str__(self):
        return f'{self.sn_number}: {self.discussion_points}'

    



class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    timestamp = models.DateTimeField(default=timezone.now)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.message}"



class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
class Survey(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='surveys')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class Question(models.Model):
    TEXT = 'text'
    MULTIPLE_CHOICE = 'choice'
    QUESTION_TYPES = [
        (TEXT, 'Text'),
        (MULTIPLE_CHOICE, 'Multiple Choice'),
    ]

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default=TEXT)
    choices = models.JSONField(null=True, blank=True)


    def __str__(self):
        return self.question_text

class Response(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    user_identifier = models.CharField(max_length=255, blank=True, null=True)
    date_submitted = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField()

    def __str__(self):
        return f"Response to {self.survey.title} by {self.user_identifier or 'Anonymous'}"

class Department(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='sub_departments')
    
    def __str__(self):
        return self.name

    def get_children(self):
        return self.sub_departments.all()

    def get_descendants(self):
        descendants = list(self.sub_departments.all())
        for child in self.sub_departments.all():
            descendants.extend(child.get_descendants())
        return descendants

class Division(models.Model):
    name = models.CharField(max_length=255)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='divisions')
    
    def __str__(self):
        return self.name

    def get_subdivisions(self):
        return self.subdivisions.all()

class SubDivision(models.Model):
    name = models.CharField(max_length=255)
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name='subdivisions')
    
    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        
        return self.create_user(username, password, **extra_fields)  
    
    def for_user(self, user):
        if user.role == 'superadmin':
           
            return self.all()
        else:
            
            return self.filter(
                departments__in=user.departments.all()
            ).distinct()
        
class User(AbstractUser):
    departments = models.ManyToManyField(Department, related_name='users', blank=True)
    divisions = models.ManyToManyField(Division, related_name='users', blank=True,null= True)
    subdivisions = models.ManyToManyField(SubDivision, related_name='users', blank=True,null=True)
    
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('departmentadmin', 'Department Admin'),
        ('divisionadmin','Division Admin'),
        ('subdivisionuser','SubDivision User'),
        ('user', 'User'),
        ('readonlyuser', 'Read Only User'),
    ]
    
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    about_me = models.TextField(blank=True, null=True)  
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    
    objects = UserManager()
    
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
    
    class Meta:
        permissions = [
            ("can_add_image", _("Can add image")),
            ("can_add_document", _("Can add document")),
            ("can_add_post", _("Can add post")),
            ("can_add_video", _("Can add video")),
        ]
        
class ImageManager(models.Manager):
     def for_user(self, user):
        print("role",user.role)
        if user.role == 'superadmin':
          
            return self.all()
        else:
         
            return self.filter(
                department__in=user.departments.all()
            ).distinct()
        
class Image(models.Model):
    def nameFile(instance, filename):
        # Check if the user is assigned, otherwise use a temporary folder
        if instance.user:
            return os.path.join('images', str(instance.user.username), filename)
        return os.path.join('images', 'default', filename)

    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to=nameFile, blank=True, null=True)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    department = models.ForeignKey('Department', on_delete=models.CASCADE)
    division = models.ForeignKey('Division', on_delete=models.CASCADE, null=True)
    subdivision = models.ForeignKey('SubDivision', on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # ForeignKey to user
    status = models.CharField(max_length=15, default='Pending')
    rating = models.IntegerField(default=2)
    dated = models.DateField(auto_now_add=True)
    tags = models.ManyToManyField('Tag', blank=True)
    status_change_date = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
     if not self.pk:
        saved_image = self.image
        self.image = None
        super().save(*args, **kwargs)
        self.image = saved_image
        if self.image:
            super().save(update_fields=['image'])
     else:
        super().save(*args, **kwargs)

    def get_username(self):
        return self.user.username
    objects =ImageManager()
                             
    def __str__(self):
        return self.title
    
class DocumentManager(models.Manager):
     def for_user(self, user):
        if user.role == 'superadmin':
           
            return self.all()
        else:
            
            return self.filter(
                department__in=user.departments.all()
            ).distinct()



class Document(models.Model):
    def nameFile(instance, filename):
        if instance.user:
            return os.path.join('documents', str(instance.user.username), filename)
        return os.path.join('documents', 'default', filename)

    title = models.CharField(max_length=100)
    docfile = models.FileField(upload_to=nameFile, blank=True, null=True)
    department = models.ForeignKey('Department', on_delete=models.CASCADE)
    division = models.ForeignKey('Division', on_delete=models.CASCADE, null=True)
    subdivision = models.ForeignKey('SubDivision', on_delete=models.CASCADE, null=True)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, default='Pending')
    last_modified = models.DateTimeField(auto_now=True)  # Changed to auto_now
    rating = models.IntegerField(default=2)
    status_change_date = models.DateField(null=True, blank=True)

    objects = DocumentManager()

    def save(self, *args, **kwargs):
        if not self.pk:
            saved_docfile = self.docfile
            self.docfile = None
            super().save(*args, **kwargs)
            self.docfile = saved_docfile
            if self.docfile:
                super().save(update_fields=['docfile'])
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_username(self):
        return self.user.username
    
class PostManager(models.Manager):
     def for_user(self, user):
        if user.role == 'superadmin':
            
            return self.all()
        else:
           
            return self.filter(
                department__in=user.departments.all()
            ).distinct()


class Post(models.Model):
    def nameFile(instance, filename):
        if instance.user:
            return os.path.join('posts', str(instance.user.username), filename)
        return os.path.join('posts', 'default', filename)
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    author = models.CharField(max_length=200, null=True, blank=True)
    department = models.ForeignKey('Department', on_delete=models.CASCADE)
    division = models.ForeignKey('Division', on_delete=models.CASCADE, null=True)
    subdivision = models.ForeignKey('SubDivision', on_delete=models.CASCADE, null=True)
    last_modified = models.DateTimeField(auto_now=True)  # Changed to auto_now
    status = models.CharField(max_length=15, default='Pending')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    status_change_date = models.DateField(null=True, blank=True)
    rating = models.IntegerField(default=2)
    image = models.ImageField(upload_to=nameFile, blank=True, null=True)
    video = models.FileField(upload_to=nameFile, blank=True, null=True)

    objects = PostManager()

    def save(self, *args, **kwargs):
        if not self.pk:
            saved_image = self.image
            saved_video = self.video
            self.image = None
            self.video = None
            super().save(*args, **kwargs)
            self.image = saved_image
            self.video = saved_video
            if self.image or self.video:
                update_fields = []
                if self.image:
                    update_fields.append('image')
                if self.video:
                    update_fields.append('video')
                super().save(update_fields=update_fields)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.title
     
class VideoManager(models.Manager):
    def for_user(self, user):
        if user.role == 'superadmin':
            
            return self.all()
        else:
            
            return self.filter(
                department__in=user.departments.all()
            ).distinct()



class Video(models.Model):
    def nameFile(instance, filename):
        if instance.user:
            return os.path.join('videos', str(instance.user.username), filename)
        return os.path.join('videos', 'default', filename)

    title = models.CharField(max_length=100)
    video = models.FileField(upload_to=nameFile, blank=True, null=True)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    department = models.ForeignKey('Department', on_delete=models.CASCADE)
    division = models.ForeignKey('Division', on_delete=models.CASCADE, null=True)
    subdivision = models.ForeignKey('SubDivision', on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=15, default='Pending')
    rating = models.IntegerField(default=2)
    dated = models.DateField(auto_now_add=True)
    tags = models.ManyToManyField('Tag', blank=True)
    status_change_date = models.DateField(null=True, blank=True)

    objects = VideoManager()

    def save(self, *args, **kwargs):
        if not self.pk:
            saved_video = self.video
            self.video = None
            super().save(*args, **kwargs)
            self.video = saved_video
            if self.video:
                super().save(update_fields=['video'])
        else:
            super().save(*args, **kwargs)

    def get_username(self):
        return self.user.username

    def __str__(self):
        return self.title

  
class Content(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True,null= True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    division = models.ForeignKey(Division, on_delete=models.CASCADE,null=True)
    subdivision = models.ForeignKey(SubDivision, on_delete=models.CASCADE,null=True)

    def __str__(self):
        return self.title

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    division = models.ForeignKey(Division, on_delete=models.CASCADE,null=True)
    subdivision = models.ForeignKey(SubDivision, on_delete=models.CASCADE,null=True)
    
    def __str__(self):
        return self.title




class Useradmin(models.Model):
    useradmin_id = models.CharField(max_length=10, unique=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="useradmin_account")

class LinkManager(models.Manager):
     def for_user(self, user):
        if user.role == 'superadmin':
           
            return self.all()
        else:
           
            return self.filter(
                department__in=user.departments.all()
            ).distinct() 
    


class Link(models.Model):
    PRINT_MEDIA = 'Print Media'
    DIGITAL_MEDIA = 'Digital Media'
    MEDIA_TYPE_CHOICES = [
        (PRINT_MEDIA, 'Print Media'),
        (DIGITAL_MEDIA, 'Digital Media'),
    ]

    def nameFile(instance, filename):
        if instance.user:
            return os.path.join('links', str(instance.user.username), filename)
        return os.path.join('links', 'default', filename)

    title = models.CharField(max_length=255, blank=True, null=True)  
    description = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES)
    image = models.ImageField(upload_to=nameFile, blank=True, null=True)
    link = models.URLField(max_length=200, blank=True, null=True)
    department = models.ForeignKey('Department', on_delete=models.CASCADE)
    division = models.ForeignKey('Division', on_delete=models.CASCADE, null=True)
    subdivision = models.ForeignKey('SubDivision', on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=15, default='Pending')
    rating = models.IntegerField(default=2)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    
    objects = LinkManager()

    def save(self, *args, **kwargs):
        if not self.pk:
            saved_image = self.image
            self.image = None
            super().save(*args, **kwargs)
            self.image = saved_image
            if self.image:
                super().save(update_fields=['image'])
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.description


class Tweet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tweets')
    tweet_id = models.CharField(max_length=255, unique=True)
    status = models.TextField()
    media_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    retweets = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    replies = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Tweet by {self.user.username} on {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.status:
            self.status = self.status.encode('utf-8').decode('utf-8')
        super().save(*args, **kwargs)

class Engagement(models.Model):
    tweet = models.OneToOneField(Tweet, on_delete=models.CASCADE, related_name='engagement')
    retweets = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    replies = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)  

    def __str__(self):
        return f"Engagement data for Tweet ID {self.tweet.tweet_id}"

    class Meta:
        ordering = ['-updated_at']        

class InstagramCredentials(models.Model):
  
    access_token = models.CharField(max_length=255)
    instagram_account_id = models.CharField(max_length=255)
    long_lived_token = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f'Instagram Credentials for {self.user.username}'        
    
class Conversation(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)  # Indicates if the message has been read
    edited = models.BooleanField(default=False)  # Indicates if the message has been edited  

class Module(models.Model):
    name = models.CharField(max_length=100)

class EmailDomainPermission(models.Model):
    domain = models.CharField(max_length=100)  # e.g., "example.com"
    allowed_modules = models.ManyToManyField(Module)
    


def name_file(instance, filename):
    return f'ticket_attachments/{instance.created_by.username}/{filename}'

class Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    SOURCE_CHOICES = [
        ('INTERNAL', 'Internal'),
        ('EMAIL', 'Email'),
        ('SOCIAL', 'Social Media'),
        ('PHONE', 'Phone'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='INTERNAL')
    due_date = models.DateTimeField(null=True, blank=True)
    is_social_media_ticket = models.BooleanField(default=False)
    social_media_platform = models.CharField(max_length=50, blank=True, null=True)
    social_media_post_id = models.CharField(max_length=100, blank=True, null=True)
    social_media_post_url = models.URLField(blank=True, null=True)
    attachment = models.ImageField(
        upload_to=name_file,
        blank=True,
        null=True,
        verbose_name="Ticket Attachment"  # This is the new addition
    )
    def __str__(self):
        return f"Ticket #{self.id}: {self.title}"

class TicketUpdate(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='updates')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    attachment = models.FileField(upload_to='ticket_updates/', blank=True, null=True)

    def __str__(self):
        return f"Update on Ticket #{self.ticket.id} by {self.user.username}"