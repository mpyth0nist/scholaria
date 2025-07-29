from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import AnnouncementSerializer
from .models import Announcement
from users.models import CustomUser
# Create your views here.


class CreateAnnoucement(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnouncementSerializer

    def get_queryset(self):

        return Announcement.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        
        serializer.save(author=self.request.user)
        
class AnnouncementUpdate(generics.UpdateAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Announcement.objects.filter(author=self.request.user)


class AnnouncementDelete(generics.DeleteAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):

        return Announcement.objects.filter(author=self.request.user)