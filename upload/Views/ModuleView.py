# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from upload.models import EmailDomainPermission, Module
from django.http import JsonResponse
from upload.Serializers.ModuleSerializer import EmailDomainPermissionSerializer, ModuleSerializer

@api_view(['GET'])
def email_domain_permissions_list(request):
    permissions = EmailDomainPermission.objects.all()
    serializer = EmailDomainPermissionSerializer(permissions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def module_list(request):
    modules = Module.objects.all()
    serializer = ModuleSerializer(modules, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def add_module(request):
    domain = request.data.get('domain')
    module_id = request.data.get('module')
    permission = EmailDomainPermission.objects.get(domain=domain)
    module = Module.objects.get(id=module_id)
    permission.allowed_modules.add(module)
    return Response({'status': 'Module added'})

@api_view(['POST'])
def remove_module(request):
    domain = request.data.get('domain')
    module_id = request.data.get('module')
    permission = EmailDomainPermission.objects.get(domain=domain)
    module = Module.objects.get(id=module_id)
    permission.allowed_modules.remove(module)
    return Response({'status': 'Module removed'})

@api_view(['GET'])
def user_modules(request):
    user_email = request.user.email
    domain = user_email.split('@')[-1]
    try:
        email_domain_permission = EmailDomainPermission.objects.get(domain=domain)
        modules = email_domain_permission.allowed_modules.values('id', 'name')
        return JsonResponse(list(modules), safe=False)
    except EmailDomainPermission.DoesNotExist:
        return JsonResponse([], safe=False)