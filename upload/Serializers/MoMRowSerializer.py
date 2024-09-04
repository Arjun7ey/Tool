from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.models import Permission
from upload.models import User, MoMRow
from upload.Serializers.DepartmentSerializer import DepartmentSerializer


class MoMRowSerializer(serializers.ModelSerializer):
    responsible_person_full_name = serializers.SerializerMethodField()
    responsible_person_id = serializers.IntegerField(source='responsible_person.id')
    responsible_person_departments = serializers.SerializerMethodField()

    class Meta:
        model = MoMRow
        fields = [
            'sn_number',
            'discussion_points',
            'discussion_lead',
            'contributors',
            'tentative_dates',
            'decision_taken',
            'action_items',
            'responsible_person_full_name',
            'responsible_person_id',
            'responsible_person_departments',
            'status',
            'comments_notes',
            'priority_level',
            'impact',
            'follow_up_required',
            'completion_percentage',
        ]

    def get_responsible_person_full_name(self, obj):
        if obj.responsible_person:
            return f"{obj.responsible_person.first_name} {obj.responsible_person.last_name}"
        return None

    def get_responsible_person_departments(self, obj):
        if obj.responsible_person:
            departments = obj.responsible_person.departments.all()
            return DepartmentSerializer(departments, many=True).data
        return []