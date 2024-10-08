from rest_framework import serializers
from upload.models import  Post
from django.contrib.auth import authenticate
from upload.models import Department,Division,SubDivision
from upload.models import Category



class PostRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'rating']

    def update(self, instance, validated_data):
        instance.rating = validated_data.get('rating', instance.rating)
        instance.save()
        return instance

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class PostUploadSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(write_only=True, required=False)
    department_name = serializers.CharField(write_only=True, required=False)
    image = serializers.ImageField(write_only=True, required=False)
    video = serializers.FileField(write_only=True, required=False)
    division_name = serializers.CharField(write_only=True, required=False)
    subdivision_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Post
        fields = ['title', 'description', 'category_name', 'status','division_name','subdivision_name', 'department_name', 'image', 'video']

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

        instance = super().create(validated_data)
        return instance

class PostDashboardSerializer(serializers.ModelSerializer):
    submitted_by = serializers.SerializerMethodField()
    submitted_on = serializers.DateTimeField(source='last_modified', format='%d %B, %Y', read_only=True)
    category_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    division_name=serializers.SerializerMethodField()
    subdivision_name=serializers.SerializerMethodField()
    status_change_date = serializers.DateField(format='%d %B, %Y', read_only=True)
    image_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'submitted_by', 'submitted_on', 'title', 'description', 'category', 'category_name', 
                  'status', 'rating', 'department_name', 'status_change_date', 'image_url', 'video_url', 'division_name', 'subdivision_name']

    def get_submitted_by(self, obj):
        first_name = obj.user.first_name
        last_name = obj.user.last_name
        return f"{first_name} {last_name}"

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_image_url(self, obj):
        return obj.image.url if obj.image else None
    
    def get_video_url(self, obj):
        return obj.video.url if obj.video else None
    
    def get_division_name(self, obj):
        return obj.division.name if obj.division else None

    def get_subdivision_name(self, obj):    
        return obj.subdivision.name if obj.subdivision else None  