from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Image, Document, User, Post, Department, Event, Content, Survey, Question
from .models import Tag, Category, Notification, MoM,  MoMRow, Link, Tweet, Engagement, Video
from django.contrib import admin
from .models import Conversation, Message, Module, EmailDomainPermission
from .models import Department, Division, SubDivision, Response
from django.utils.html import format_html
from .models import Ticket, TicketUpdate

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'get_subdivisions_names')
    search_fields = ('name', 'department__name')

    def get_subdivisions_names(self, obj):
        return ", ".join([subdivision.name for subdivision in obj.get_subdivisions()])
    get_subdivisions_names.short_description = 'SubDivisions'

@admin.register(SubDivision)
class SubDivisionAdmin(admin.ModelAdmin):
    list_display = ('name', 'division', 'get_department_name')
    search_fields = ('name', 'division__name', 'division__department__name')

    def get_department_name(self, obj):
        return obj.division.department.name
    get_department_name.short_description = 'Department'

class CustomUserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name','phone_number','about_me', 'email','profile_picture')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Additional info', {'fields': ('role', 'departments','divisions','subdivisions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'departments', 'role'),
        }),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'role')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)


admin.site.register(User, CustomUserAdmin)


class ImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'image_display', 'rating', 'dated', 'get_username', 'category', 'status']

    def get_username(self, obj):
        return obj.user.username

    get_username.admin_order_field = 'user'  # Allows column order sorting
    get_username.short_description = 'Username'  # Renames column head

    def image_display(self, obj):
        return obj.image.url if obj.image else "No Image"

    image_display.short_description = 'Image'  # Renames column head

admin.site.register(Image, ImageAdmin)

class VideoAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'video_display', 'rating', 'dated', 'get_username', 'category', 'status']

    def get_username(self, obj):
        return obj.user.username

    get_username.admin_order_field = 'user'  # Allows column order sorting
    get_username.short_description = 'Username'  # Renames column head

    def video_display(self, obj):
        return obj.video.url if obj.video else "No Video"

    video_display.short_description = 'Video'  # Renames column head

admin.site.register(Video, VideoAdmin)

class DocumentAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'docfile', 'get_username', 'category', 'status']

    def get_username(self, obj):
        return obj.user.username

    get_username.admin_order_field = 'user'  # Allows column order sorting
    get_username.short_description = 'Username'  # Renames column head

admin.site.register(Document, DocumentAdmin)


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'description', 'get_username', 'last_modified', 'status', 'image_preview', 'video_display']
    
    def get_username(self, obj):
        return obj.user.username

    get_username.admin_order_field = 'user'  # Allows column order sorting
    get_username.short_description = 'Username'  # Renames column head

    def image_preview(self, obj):
        if obj.image:
            return '<img src="{}" width="100" />'.format(obj.image.url)
        return 'No image'
    image_preview.allow_tags = True  # Allows HTML to be rendered
    image_preview.short_description = 'Image Preview'

    def video_display(self, obj):
        if obj.video:
            return '<a href="{}">View Video</a>'.format(obj.video.url)
        return 'No video'
    video_display.allow_tags = True  # Allows HTML to be rendered
    video_display.short_description = 'Video'

admin.site.register(Post, PostAdmin)


class ContentAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'get_department', 'start_time', 'end_time', 'created_by']

    def get_department(self, obj):
        return obj.department.name if obj.department else None
    
    get_department.short_description = 'Department'

admin.site.register(Content, ContentAdmin)

class EventAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'get_department', 'start_time', 'end_time', 'created_by']
    def get_department(self, obj):
        return obj.department.name if obj.department else None
    
    get_department.short_description = 'Department'

admin.site.register(Event, EventAdmin)

class SurveyAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Survey._meta.fields]  # Dynamically display all fields

class ResponseAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Response._meta.fields]  # Dynamically     


admin.site.register(Response, ResponseAdmin)
admin.site.register(Survey, SurveyAdmin)

class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id','survey']

admin.site.register(Question, QuestionAdmin)

class TagAdmin(admin.ModelAdmin):
    list_display = ['id','name']

admin.site.register(Tag, TagAdmin)

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id','name']

admin.site.register(Category, CategoryAdmin)

class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id','user','message']

admin.site.register(Notification, NotificationAdmin)

class MoMAdmin(admin.ModelAdmin):
    list_display = ['sn_number','title']

admin.site.register(MoM, MoMAdmin)

class MoMRowAdmin(admin.ModelAdmin):
    list_display = ['sn_number','sn_num',]

    def mom_row_sn_number(self, obj):
        return obj.sn_number
    mom_row_sn_number.short_description = 'MoMRow Serial Number'
    
    def sn_num(self, obj):
        return obj.mom.sn_number
    sn_num.short_description = 'MoM Serial Number'


admin.site.register(MoMRow, MoMRowAdmin)


class LinkAdmin(admin.ModelAdmin):
    list_display = ['id', 'title','type', 'image_display', 'category','rating','created_at', 'get_username','description', 'status']

    def get_username(self, obj):
        return obj.user.username

    get_username.admin_order_field = 'user'  # Allows column order sorting
    get_username.short_description = 'Username'  # Renames column head

    def image_display(self, obj):
        return obj.image.url if obj.image else "No Image"

    image_display.short_description = 'Image'  # Renames column head

admin.site.register(Link, LinkAdmin)

@admin.register(Tweet)
class TweetAdmin(admin.ModelAdmin):
    list_display = ('user', 'tweet_id', 'status', 'media_url', 'created_at', 'retweets', 'likes', 'replies')
    list_filter = ('created_at', 'user')
    search_fields = ('tweet_id', 'status', 'user__username')

@admin.register(Engagement)
class EngagementAdmin(admin.ModelAdmin):
    list_display = ('tweet', 'retweets', 'likes', 'replies', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('tweet__tweet_id',)


class ConversationAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Conversation._meta.fields]

class MessageAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Message._meta.fields]

admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message, MessageAdmin)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')  # Show the ID and name of the module in the admin list
    search_fields = ('name',)  # Add search capability by module name

# Define the EmailDomainPermission admin to allow managing which modules are allowed for each email domain
@admin.register(EmailDomainPermission)
class EmailDomainPermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'domain')  # Show the ID and domain in the admin list
    search_fields = ('domain',)  # Add search capability by domain
    filter_horizontal = ('allowed_modules',)


class TicketUpdateInline(admin.TabularInline):
    model = TicketUpdate
    extra = 1

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'priority', 'created_by', 'assigned_to', 'created_at', 'due_date')
    list_filter = ('status', 'priority', 'source', 'is_social_media_ticket')
    search_fields = ('title', 'description', 'created_by__username', 'assigned_to__username')
    readonly_fields = ('created_at', 'updated_at', 'display_attachment')  # Moved display_attachment to readonly_fields
    raw_id_fields = ('created_by', 'assigned_to')
    date_hierarchy = 'created_at'
    inlines = [TicketUpdateInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'status', 'priority', 'source')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'due_date')
        }),
        ('Users', {
            'fields': ('created_by', 'assigned_to')
        }),
        ('Social Media', {
            'fields': ('is_social_media_ticket', 'social_media_platform', 'social_media_post_id', 'social_media_post_url'),
            'classes': ('collapse',),
        }),
        ('Attachment', {
            'fields': ('attachment',)
        }),
    )

    def display_attachment(self, obj):
        if obj.attachment:
            return format_html('<a href="{}" target="_blank"><img src="{}" width="150" height="150" /></a>', obj.attachment.url, obj.attachment.url)
        return "No attachment"
    display_attachment.short_description = 'Attachment Preview'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(TicketUpdate)
class TicketUpdateAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('ticket__title', 'user__username', 'content')
    raw_id_fields = ('ticket', 'user')
