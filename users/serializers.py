from rest_framework import serializers 
from .models import CustomUser
# Create your views here.


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ["id", "username","password","first_name", "last_name", "email", "role", "birth_date"]
        extra_kwarfs = { 'password' : {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

