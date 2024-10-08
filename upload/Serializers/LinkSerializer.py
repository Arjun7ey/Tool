from rest_framework import serializers
from upload.models import Image
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from upload.models import Department, Division,SubDivision
from rest_framework.response import Response
from upload.models import Tag, Link
from upload.models import Category
from django.contrib.auth.models import Permission


class LinkRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = ['id', 'rating', 'image']  

    def update(self, instance, validated_data):
        instance.rating = validated_data.get('rating', instance.rating)
        instance.save()
        return instance
    
class LinkUploadSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(write_only=True, required=False)
    department_name = serializers.CharField(write_only=True, required=False)
    link = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Link
        fields = ['description', 'type', 'link', 'image', 'category_name', 'status', 'department_name']

   

    def create(self, validated_data):
        category_name = validated_data.pop('category_name', None)
        department_name = validated_data.pop('department_name', None)
        division_name = validated_data.pop('division_name', None)
        subdivision_name = validated_data.pop('subdivision_name', None)
        
        if category_name:
            category, created = Category.objects.get_or_create(name=category_name)
            validated_data['category'] = category
    
            # Check if category is "Urgent" and set status to "Approved"
            if category_name == "Urgent":
                validated_data['status'] = 'Approved'
        
        if department_name:
            department, created = Department.objects.get_or_create(name=department_name)
            validated_data['department'] = department

        if division_name:
            division, created = Division.objects.get_or_create(name=division_name)
            validated_data['division'] = division
        
        if subdivision_name:
            subdivision, created = SubDivision.objects.get_or_create(name=subdivision_name)
            validated_data['subdivision'] = subdivision    

        return super().create(validated_data)

        
        

class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = '__all__'

class LinkDashboardSerializer(serializers.ModelSerializer):
    submitted_by = serializers.SerializerMethodField()
    submitted_on = serializers.DateTimeField(source='created_at', format='%d %B, %Y', read_only=True)
    file = serializers.ImageField(source='image', read_only=True)
    category_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    division_name=serializers.SerializerMethodField()
    subdivision_name=serializers.SerializerMethodField()

    class Meta:
        model = Link
        fields = ['id', 'title','type', 'link','submitted_by', 'submitted_on', 'file', 'category_name', 'status', 'description', 'rating', 'department_name', 'division_name', 'subdivision_name']

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