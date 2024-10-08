from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.views import View
from django.db.models.functions import Concat
from django.db.models import F, Value as V
from django.http import JsonResponse
from rest_framework.response import Response
from upload.models import Survey, Question, Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from rest_framework import status
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import IsAuthenticated

@method_decorator(csrf_exempt, name='dispatch')
class CreateSurveyView(APIView):
    def get(self, request):
        return JsonResponse({"message": "Use POST to create a new survey"})

    def post(self, request):
        data = json.loads(request.body)
        survey = Survey.objects.create(
            title=data['title'],
            description=data['description'],
            creator=request.user
        )
        for question_data in data['questions']:
            Question.objects.create(
                survey=survey,
                question_text=question_data['text'],
                question_type=question_data['type'],
                choices=question_data.get('choices')
            )
        return JsonResponse({
            'id': survey.id, 
            'title': survey.title,
            'creator': request.user.username
        }, status=201)

class ListSurveysView(View):
    def get(self, request):
        surveys = Survey.objects.annotate(
            creator_full_name=Concat(
                F('creator__first_name'), 
                V(' '), 
                F('creator__last_name')
            )
        ).values('id', 'title', 'description', 'creator_full_name')
        
        return JsonResponse(list(surveys), safe=False)

class SurveyDetailView(APIView):
    def get(self, request, survey_id):
        survey = get_object_or_404(Survey, id=survey_id)
        questions = survey.questions.all().values('id', 'question_text', 'question_type', 'choices')
        return JsonResponse({
            'survey': {
                'id': survey.id,
                'title': survey.title,
                'description': survey.description
            },
            'questions': list(questions)
        })

@method_decorator(csrf_exempt, name='dispatch')
class SaveResponseView(APIView):
    def post(self, request, survey_id):
        survey = get_object_or_404(Survey, id=survey_id)
        data = json.loads(request.body)
        response = Response.objects.create(
            survey=survey,
            user_identifier=data.get('user_identifier'),
            answers=data['answers']
        )
        return JsonResponse({'message': 'Response saved successfully'}, status=201)