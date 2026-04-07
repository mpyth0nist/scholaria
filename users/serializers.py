from rest_framework import serializers 
from .models import CustomUser
from courses.models import Course
from courses.serializers import CourseSerializer
# Create your views here.


class UserSerializer(serializers.ModelSerializer):

    courses_taught = CourseSerializer(many=True, read_only=True)
    student_courses = CourseSerializer(many=True, read_only=True)
    class Meta:
        model = CustomUser
        fields = ["id", "username","password","first_name", "last_name", "email", "role", "birth_date", "courses_taught", "student_courses"]
        extra_kwargs = { 'password' : {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

