from rest_framework import serializers
from upload.models import Image
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from upload.models import Department, Division, SubDivision
from rest_framework.response import Response
from upload.models import Tag
from upload.models import Category
from django.contrib.auth.models import Permission


class ImageRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'rating', 'image']  

    def update(self, instance, validated_data):
        instance.rating = validated_data.get('rating', instance.rating)
        instance.save()
        return instance
    
class ImageUploadSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(write_only=True, required=False)
    department_name = serializers.CharField(write_only=True, required=False)
    division_name = serializers.CharField(write_only=True, required=False)
    subdivision_name = serializers.CharField(write_only=True, required=False)
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Image
        fields = ['title', 'image', 'category_name', 'status', 'tags', 'department_name','division_name','subdivision_name']

    def create(self, validated_data):
        category_name = validated_data.pop('category_name', None)
        tag_names = validated_data.pop('tags', [])
        department_name = validated_data.pop('department_name', None)
        division_name = validated_data.pop('division_name', None)
        subdivision_name = validated_data.pop('subdivision_name', None)
       
        
    
        # Convert empty string to empty list
        if isinstance(tag_names, str) and not tag_names.strip():
            tag_names = []
    
        # Handle category
        if category_name:
            category, created = Category.objects.get_or_create(name=category_name)
            validated_data['category'] = category
    
            # Check if category is "Urgent" and set status to "Approved"
            if category_name == "Urgent":
                validated_data['status'] = 'Approved'
    
        # Handle department
        if department_name:
            department, created = Department.objects.get_or_create(name=department_name)
            validated_data['department'] = department

        if division_name:
            division, created = Division.objects.get_or_create(name=division_name)
            validated_data['division'] = division
        
        if subdivision_name:
            subdivision, created = SubDivision.objects.get_or_create(name=subdivision_name)
            validated_data['subdivision'] = subdivision    
    
        # Handle tags
        tags = []
        for tag_name in tag_names:
            if tag_name:
                tag, created = Tag.objects.get_or_create(name=tag_name)
                tags.append(tag)
    
        # Create instance and set tags
        instance = super().create(validated_data)
        instance.tags.set(tags)
    
        return instance


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'

class ImageDashboardSerializer(serializers.ModelSerializer):
    submitted_by = serializers.SerializerMethodField()
    submitted_on = serializers.DateField(source='dated', format='%d %B, %Y', read_only=True)
    file = serializers.ImageField(source='image', read_only=True)
    category_name = serializers.SerializerMethodField()
    tags_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    division_name=serializers.SerializerMethodField()
    subdivision_name=serializers.SerializerMethodField()
    status_change_date = serializers.DateField(format='%d %B, %Y', read_only=True) 

    class Meta:
        model = Image
        fields = [
            'id', 'title', 'submitted_by', 'submitted_on', 'file', 
            'category_name', 'status', 'tags_name', 'rating', 
            'department_name', 'status_change_date' , 'division_name', 'subdivision_name' 
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
    
    def get_division_name(self, obj):
        return obj.division.name if obj.division else None
    
    def get_subdivision_name(self, obj):
        return obj.subdivision.name if obj.subdivision else None
