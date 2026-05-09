from rest_framework import serializers
from .models import User, UserPhoto

class UserPhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()  # return cloudinary URL if available, else local

    class Meta:
        model = UserPhoto
        fields = ['id', 'image', 'order', 'uploaded_at']

    def get_image(self, obj):
        # if cloudinary URL exists return that, otherwise fall back to local image
        if obj.cloudinary_image:
            return obj.cloudinary_image
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class UserSerializer(serializers.ModelSerializer):
    photos = UserPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'phone_number',
            'name',
            'gender',
            'city',
            'description',
            'category',
            'is_verified',
            'is_profile_complete',
            'is_approved',
            'photos',
            'created_at',
        ]
        read_only_fields = ['is_verified', 'is_profile_complete', 'is_approved', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['phone_number', 'name', 'gender', 'city', 'category']

    def create(self, validated_data):
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            name=validated_data['name'],
            gender=validated_data['gender'],
            city=validated_data['city'],
        )
        user.category = validated_data['category']
        user.save()
        return user