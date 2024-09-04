from rest_framework import serializers
from upload.models import Video
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from upload.models import Department, Tag, Category
from django.contrib.auth.models import Permission


class VideoRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'rating', 'video']  

    def update(self, instance, validated_data):
        instance.rating = validated_data.get('rating', instance.rating)
        instance.save()
        return instance
    
class VideoUploadSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(write_only=True, required=False)
    department_name = serializers.CharField(write_only=True, required=False)
    tags = serializers.ListField(child=serializers.CharField(max_length=50), allow_null=True, required=False)

    class Meta:
        model = Video
        fields = ['title', 'video', 'category_name', 'status', 'tags', 'department_name']

    def create(self, validated_data):
        category_name = validated_data.pop('category_name', None)
        tag_names = validated_data.pop('tags', [])
        department_name = validated_data.pop('department_name', None)
        
        if category_name:
            category, created = Category.objects.get_or_create(name=category_name)
            validated_data['category'] = category
         
        if department_name:
            department, created = Department.objects.get_or_create(name=department_name)
            validated_data['department'] = department

        tags = []
        for tag_name in tag_names:
            if tag_name:  
                tag, created = Tag.objects.get_or_create(name=tag_name)
                tags.append(tag)
        
        instance = super().create(validated_data)
        instance.tags.set(tags)
        
        return instance

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'

class VideoDashboardSerializer(serializers.ModelSerializer):
    submitted_by = serializers.SerializerMethodField()
    submitted_on = serializers.DateField(source='dated', format='%d %B, %Y', read_only=True)
    file = serializers.FileField(source='video', read_only=True)
    category_name = serializers.SerializerMethodField()
    tags_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    status_change_date = serializers.DateField(format='%d %B, %Y', read_only=True) 

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'submitted_by', 'submitted_on', 'file', 
            'category_name', 'status', 'tags_name', 'rating', 
            'department_name', 'status_change_date'  
        ]

    def get_submitted_by(self, obj):
        first_name = obj.user.first_name
        last_name = obj.user.last_name
        return f"{first_name} {last_name}"

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_tags_name(self, obj):
        return [tag.name for tag in obj.tags.all()]

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None
