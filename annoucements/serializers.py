from rest_framework import serializers
from .models import Announcement

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        Model = Announcement
        fields = ['announcement_subject', 'annoucement_text', 'author']