from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
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
from upload.Serializers.DepartmentSerializer import DepartmentSerializer
from django.views.decorators.http import require_http_methods



@api_view(['GET'])
def departments_api(request):
   
    departments = Department.objects.all()
    
    
    serializer = DepartmentSerializer(departments, many=True)
    
 
    return Response(serializer.data)


@api_view(['POST'])
def add_department(request):
    if request.method == 'POST':
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    
@api_view(['GET'])
def departments_list_user_wise(request):
    user = request.user

    if user.role == 'superadmin':
        departments = Department.objects.all().values('id', 'name')
    else:
        departments = user.departments.all().values('id', 'name')

    return JsonResponse(list(departments), safe=False)  

    


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
