from rest_framework import serializers
from upload.models import Question, Survey
from upload.Serializers.QuestionSerializer import QuestionSerializer


class SurveySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        survey = Survey.objects.create(**validated_data)

        for question_data in questions_data:
            Question.objects.create(survey=survey, **question_data)

        return survey