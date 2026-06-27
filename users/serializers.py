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

    def update(self, instance, validated_data):
        # Prevent self-promotion: users cannot change their own role via this serializer.
        # Role changes must go through AdminUserSerializer (admin-only endpoints).
        validated_data.pop('role', None)

        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def validate_role(self, value):
        if value == 'ADMIN':
            raise serializers.ValidationError("You cannot register or set your role as an Admin.")
        return value

class AdminUserSerializer(serializers.ModelSerializer):
    courses_taught = CourseSerializer(many=True, read_only=True)
    student_courses = CourseSerializer(many=True, read_only=True)
    class Meta:
        model = CustomUser
        fields = ["id", "username","password","first_name", "last_name", "email", "role", "birth_date", "courses_taught", "student_courses"]
        extra_kwargs = { 'password' : {'write_only': True, 'required': False}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        # Allow updating without requiring password
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

