from rest_framework import serializers
from upload.models import Image, User, Useradmin , Document, Post
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from upload.models import Department, Division, SubDivision
from django.contrib.auth.models import Permission
from upload.models import User
from rest_framework_simplejwt.serializers import TokenRefreshSerializer


class UserPicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'profile_picture']


class AllUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name']  # Adjust fields as needed

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class UserPermissionsUpdateSerializer(serializers.Serializer):
    permissions = serializers.DictField(child=serializers.BooleanField())

    def update(self, user, validated_data):
        permissions_data = validated_data.get('permissions', {})
        
        # Mapping of readable permission names to codename
        permission_mapping = {
            'Can Upload Image': 'can_add_image',
            'Can Upload Document': 'can_add_document',
            'Can Post': 'can_add_post',
            'Can Upload Video': 'can_add_video',  # Added video permission
        }

        for perm_name, has_permission in permissions_data.items():
            codename = permission_mapping.get(perm_name)
            if codename:
                try:
                    perm_obj = Permission.objects.get(codename=codename)
                    if has_permission:
                        user.user_permissions.add(perm_obj)
                    else:
                        user.user_permissions.remove(perm_obj)
                except Permission.DoesNotExist:
                    print(f"Permission with codename '{codename}' does not exist.")
        
        user.save()
        return user

    
class UserPermissionsSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'permissions']

    def get_permissions(self, user):
        perms = {
            'can_add_image': user.has_perm('upload.can_add_image'),
            'can_add_document': user.has_perm('upload.can_add_document'),
            'can_add_post': user.has_perm('upload.can_add_post'),
            'can_add_video': user.has_perm('upload.can_add_video'),  # Added video permission
        }
        return perms


class CreateUserSerializer(serializers.ModelSerializer):
    department_names = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    departments = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), many=True, required=False)
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'role', 'department_names',
            'departments', 'is_staff', 'first_name', 'last_name', 'phone_number',
            'profile_picture'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if User.objects.filter(username=data.get('username')).exists():
            raise serializers.ValidationError({"username": "Username already taken."})
        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError({"email": "Email already taken."})
        return data

    def create(self, validated_data):
        department_names = validated_data.pop('department_names', [])
        departments = validated_data.pop('departments', [])
        profile_picture = validated_data.pop('profile_picture', None)

        password = validated_data.pop('password', None)

        user = User(**validated_data)
        
        if password:
            user.set_password(password)

        if profile_picture:
            user.profile_picture = profile_picture

        user.save()

        # Handle department names
        for department_name in department_names:
            department, created = Department.objects.get_or_create(name=department_name)
            user.departments.add(department)

        # Handle departments if provided
        for department in departments:
            user.departments.add(department)

        return user

class UserSerializer(serializers.ModelSerializer):
    department_names = serializers.SerializerMethodField()
    department_ids = serializers.ListField(write_only=True, required=False)
    departments = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), many=True, required=False)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True
    )
    
    division_names = serializers.SerializerMethodField()
    division_ids = serializers.ListField(write_only=True, required=False)
    divisions = serializers.PrimaryKeyRelatedField(queryset=Division.objects.all(), many=True, required=False)
    
    subdivision_names = serializers.SerializerMethodField()
    subdivision_ids = serializers.ListField(write_only=True, required=False)
    subdivisions = serializers.PrimaryKeyRelatedField(queryset=SubDivision.objects.all(), many=True, required=False)

    full_name = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(max_length=None, use_url=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'first_name', 'last_name', 'email', 
            'password', 'role', 'department_id', 'department_ids', 'department_names', 
            'division_ids', 'division_names', 'subdivision_ids', 'subdivision_names',
            'is_staff', 'departments', 'divisions', 'subdivisions', 'profile_picture', 
            'phone_number', 'about_me'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def get_department_names(self, obj):
        return [department.name for department in obj.departments.all()]

    def get_division_names(self, obj):
        return [division.name for division in obj.divisions.all()]

    def get_subdivision_names(self, obj):
        return [subdivision.name for subdivision in obj.subdivisions.all()]

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        role = validated_data.get('role', instance.role)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)

        departments = validated_data.get('department_ids', None)
        divisions = validated_data.get('division_ids', None)
        subdivisions = validated_data.get('subdivision_ids', None)

        if departments is not None:
            instance.departments.clear()
            instance.departments.add(*departments)
        
        if divisions is not None:
            instance.divisions.clear()
            instance.divisions.add(*divisions)
        
        if subdivisions is not None:
            instance.subdivisions.clear()
            instance.subdivisions.add(*subdivisions)

        if role == 'departmentadmin':
            instance.role = 'departmentadmin'
            instance.is_staff = True
        if role == 'user':
            instance.role = 'user'
            instance.is_staff = False
        if role == 'readonlyuser':
            instance.role = 'readonlyuser'
            instance.is_staff = False
        
        instance.save()
        return instance

    def create(self, validated_data):
        department_names = validated_data.get('departments', [])
        division_names = validated_data.get('divisions', [])
        subdivision_names = validated_data.get('subdivisions', [])

        if 'departments' in validated_data:
            del validated_data['departments']
        if 'divisions' in validated_data:
            del validated_data['divisions']
        if 'subdivisions' in validated_data:
            del validated_data['subdivisions']

        user = User.objects.create(**validated_data)
        
        for department_name in department_names:
            department, _ = Department.objects.get_or_create(name=department_name)
            user.departments.add(department)
        
        for division_name in division_names:
            division, _ = Division.objects.get_or_create(name=division_name)
            user.divisions.add(division)
        
        for subdivision_name in subdivision_names:
            subdivision, _ = SubDivision.objects.get_or_create(name=subdivision_name)
            user.subdivisions.add(subdivision)
        
        return user


class UserInfoSerializer(serializers.Serializer):
    is_superuser = serializers.BooleanField()
    department = serializers.CharField(allow_null=True, required=False)


class UseradminSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Useradmin
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        useradmin = Useradmin.objects.create(user=user, **validated_data)
        return useradmin

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        # Add custom validation if needed
        return super().validate(attrs)
    
class UserNewSerializer(serializers.ModelSerializer):
    departments = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), many=True, required=False)
    divisions = serializers.PrimaryKeyRelatedField(queryset=Division.objects.all(), many=True, required=False)
    subdivisions = serializers.PrimaryKeyRelatedField(queryset=SubDivision.objects.all(), many=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'profile_picture', 'role', 'departments', 'divisions', 'subdivisions']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        departments = validated_data.pop('departments', [])
        divisions = validated_data.pop('divisions', [])
        subdivisions = validated_data.pop('subdivisions', [])

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if departments:
            user.departments.set(departments)
        if divisions:
            user.divisions.set(divisions)
        if subdivisions:
            user.subdivisions.set(subdivisions)

        return user  