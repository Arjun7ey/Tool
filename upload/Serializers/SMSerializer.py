from rest_framework import serializers
from upload.models import Tweet, Engagement

class TweetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tweet
        fields = ['id', 'tweet_id', 'text', 'media_id', 'created_at']

class EngagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Engagement
        fields = ['id', 'tweet', 'engagement_type', 'count', 'created_at']        