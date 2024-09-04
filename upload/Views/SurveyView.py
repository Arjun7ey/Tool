from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.response import Response
from django.urls import reverse_lazy
import logging
from django.views.decorators.http import require_http_methods
from openpyxl import Workbook
from upload.Serializers.SurveySerializer import SurveySerializer
from upload.Serializers.QuestionSerializer import QuestionSerializer
from upload.models import Survey, Question
from rest_framework import generics





class SurveyListCreateAPIView(generics.ListCreateAPIView):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer

class SurveyRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer

class SurveyCreateWithQuestionsAPIView(generics.CreateAPIView):
    serializer_class = SurveySerializer

    def create(self, request, *args, **kwargs):
        
        survey_serializer = self.get_serializer(data=request.data)
        if not survey_serializer.is_valid():
            return Response(survey_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
        survey = survey_serializer.save()
        print(f"Created Survey: {survey.title}, ID: {survey.id}")

        headers = self.get_success_headers(survey_serializer.data)
        return Response(survey_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    

class QuestionListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        survey_id = self.kwargs['survey_id']
        return Question.objects.filter(survey_id=survey_id)

    def perform_create(self, serializer):
        survey_id = self.kwargs['survey_id']
        survey = Survey.objects.get(pk=survey_id)
        print(f"Survey ID for question: {survey_id}")  
        serializer.save(survey=survey)


class QuestionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
