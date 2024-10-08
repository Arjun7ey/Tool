from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.response import Response
from upload.models import Department,Division, SubDivision
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from django.middleware.csrf import get_token
from rest_framework import views, status
from upload.Serializers.DepartmentSerializer import DepartmentSerializer, DivisionSerializer
from django.views.decorators.http import require_http_methods



@api_view(['GET'])
def departments_api(request):
   
    departments = Department.objects.all()
    
    
    serializer = DepartmentSerializer(departments, many=True)
    
 
    return Response(serializer.data)



@api_view(['POST'])
def add_department(request):
    if request.method == 'POST':
        try:
            # Fetch the Environment Department
            environment_dept = Department.objects.get(name='Environment Department')
            
            # Create a mutable copy of request.data
            data = request.data.copy()
            
            # Add the department id to the data
            data['department'] = environment_dept.id
            
            serializer = DivisionSerializer(data=data)
            if serializer.is_valid():
                division = serializer.save(department=environment_dept)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Department.DoesNotExist:
            return Response({"error": "Environment Department not found"}, status=status.HTTP_404_NOT_FOUND)
        

@api_view(['GET'])
def departments_list_user_wise(request):
    user = request.user

    if user.role == 'superadmin':
        # Superadmin has access to all departments, divisions, and subdivisions
        departments = Department.objects.all().values('id', 'name')
        divisions = Division.objects.all().values('id', 'name')
        subdivisions = SubDivision.objects.all().values('id', 'name')
    else:
        # For other users, filter based on the user's departments
        departments = user.departments.all().values('id', 'name')

        # Fetch divisions that belong to the user's departments
        divisions = Division.objects.filter(department__in=user.departments.all()).values('id', 'name')

        # Extract division IDs
        division_ids = divisions.values_list('id', flat=True)

        # Fetch subdivisions that belong to the divisions retrieved above
        subdivisions = SubDivision.objects.filter(division__id__in=division_ids).values('id', 'name')

    return JsonResponse({
        'departments': list(departments),
        'divisions': list(divisions),
        'subdivisions': list(subdivisions)
    }, safe=False)


@api_view(['GET'])
def departments_divisions_subdivisions_list_user_wise(request):
    user = request.user
    data = []

    if user.role == 'superadmin':
       departments = Department.objects.exclude(name='Super Department').values('id', 'name')
    else:
        departments = user.departments.exclude(name='Super Department').values('id', 'name')

    for department in departments:
        dept_id = department['id']
        divisions = Division.objects.filter(department_id=dept_id).values('id', 'name')
        dept_divisions = []

        for division in divisions:
            div_id = division['id']
            subdivisions = SubDivision.objects.filter(division_id=div_id).values('id', 'name')
            dept_divisions.append({
                'id': div_id,
                'name': division['name'],
                'subdivisions': list(subdivisions),
            })

        data.append({
            'id': dept_id,
            'name': department['name'],
            'divisions': dept_divisions,
        })
    
    return JsonResponse(data, safe=False)
