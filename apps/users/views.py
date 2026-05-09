from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, UserPhoto, OTP, CategorySeat
from .serializers import UserSerializer, RegisterSerializer
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from decouple import config
import requests
from twilio.rest import Client
from django_ratelimit.decorators import ratelimit


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        gender = serializer.validated_data.get('gender')
        category = serializer.validated_data.get('category')

        seat, created = CategorySeat.objects.get_or_create(category=category)

        if gender == 'M':
            if not seat.male_seats_available():
                return Response({
                    'error': 'This category is currently full for males. Please try another category or check back later.',
                    'male_count': seat.male_count,
                    'female_count': seat.female_count,
                }, status=status.HTTP_400_BAD_REQUEST)

            user = serializer.save()
            seat.male_count += 1
            seat.save()

        else:
            user = serializer.save()
            seat.female_count += 1
            seat.save()

        return Response({
            'message': 'Registration successful. Please verify your phone number.',
            'user_id': user.id,
        }, status=status.HTTP_201_CREATED)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PhotoUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.photos.count() >= 4:
            return Response({'error': 'Maximum 4 photos allowed'}, status=status.HTTP_400_BAD_REQUEST)

        image = request.FILES.get('image')

        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        import cloudinary.uploader
        upload_result = cloudinary.uploader.upload(
            image,
            folder='blunt/user_photos',
            public_id=f"user_{request.user.id}_{request.user.photos.count()}",
        )

        photo = UserPhoto.objects.create(
            user=request.user,
            cloudinary_image=upload_result['secure_url'],
            order=request.user.photos.count()
        )

        return Response({
            'message': 'Photo uploaded successfully',
            'photo_id': photo.id,
            'image_url': upload_result['secure_url'],
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, photo_id):
        try:
            photo = UserPhoto.objects.get(id=photo_id, user=request.user)
            photo.delete()
            return Response({'message': 'Photo deleted'}, status=status.HTTP_200_OK)
        except UserPhoto.DoesNotExist:
            return Response({'error': 'Photo not found'}, status=status.HTTP_404_NOT_FOUND)


class SendOTPView(APIView):
    permission_classes = [AllowAny]


    
    def post(self, request):
        phone_number = request.data.get('phone_number')

        if not phone_number:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response({'error': 'No account found with this phone number'}, status=status.HTTP_404_NOT_FOUND)

        OTP.objects.filter(user=user, is_used=False).update(is_used=True)

        code = OTP.generate_code()
        OTP.objects.create(user=user, code=code, expires_at=timezone.now() + timezone.timedelta(minutes=10))

        # send OTP via Twilio
        try:
            client = Client(config('TWILIO_ACCOUNT_SID'), config('TWILIO_AUTH_TOKEN'))
            client.messages.create(
                body=f"Your Blunt OTP is: {code}. Valid for 10 minutes.",
                from_=config('TWILIO_PHONE_NUMBER'),
                to=f"+91{phone_number}",  # adding India country code
            )
            print(f"OTP sent to +91{phone_number}: {code}")
        except Exception as e:
            print(f"Twilio error: {e}")
            # still return success so user knows OTP was generated
            # check terminal for the OTP during testing

        return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        code = request.data.get('code')

        if not phone_number or not code:
            return Response({'error': 'Phone number and OTP code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response({'error': 'No account found with this phone number'}, status=status.HTTP_404_NOT_FOUND)

        try:
            otp = OTP.objects.filter(
                user=user,
                code=code,
                is_used=False
            ).latest('created_at')
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        if not otp.is_valid():
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()

        user.is_verified = True
        user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Phone number verified successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)