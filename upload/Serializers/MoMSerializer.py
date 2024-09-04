from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from upload.models import MoMRow, User, MoM
from upload.Serializers.MoMRowSerializer import MoMRowSerializer




class MoMSerializer(serializers.ModelSerializer):
    rows = MoMRowSerializer(many=True, read_only=True)  
    
    class Meta:
        model = MoM
        fields = [
            'title',
            'sn_number',
            'created_at',
            'updated_at',
            'rows',  
        ]

class MoMViewSerializer(serializers.ModelSerializer):
    mom_rows_create = MoMRowSerializer(many=True, write_only=True)

    class Meta:
        model = MoM
        fields = [
            'title',
            'mom_rows_create',
        ]

    def create(self, validated_data):
        # Extract mom_rows data from validated_data
        mom_rows_data = validated_data.pop('mom_rows_create', [])
        
        # Create the MoM instance
        mom = MoM.objects.create(**validated_data)

        # Iterate over each MoMRow data
        for row_data in mom_rows_data:
            # Extract responsible_person dictionary
            responsible_person_data = row_data.pop('responsible_person', None)
            
            # Initialize responsible_person variable
            responsible_person = None
            if responsible_person_data:
                responsible_person_id = responsible_person_data.get('id', None)
                if responsible_person_id:
                    try:
                        # Retrieve the User object based on the ID
                        responsible_person = User.objects.get(id=responsible_person_id)
                    except User.DoesNotExist:
                        # Raise validation error if the user does not exist
                        raise serializers.ValidationError({'responsible_person': f"User with id {responsible_person_id} does not exist"})

            # Create MoMRow instance
            MoMRow.objects.create(
                mom=mom,
                responsible_person=responsible_person,
                **row_data
            )

        return mom