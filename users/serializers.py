from rest_framework import serializers 
from .models import CustomUser
from courses.models import Course
from courses.serializers import CourseSerializer
# Create your views here.


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ["id", "username","password","first_name", "last_name", "email", "role", "birth_date"]
        extra_kwargs = { 'password' : {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

