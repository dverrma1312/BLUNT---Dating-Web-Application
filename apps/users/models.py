from django.db import models  # imports Django's model base classes
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin  # imports base classes for custom user model
import random  # imports random module to generate OTP
from django.utils import timezone  # imports timezone for expiry time
# UserManager tells Django how to create users and superusers
# We need this because we replaced username with phone_number
class UserManager(BaseUserManager):

    def create_user(self, phone_number, name, gender, city, password=None):
        # this method creates a regular user
        if not phone_number:
            raise ValueError('Phone number is required')  # phone number is mandatory
        
        user = self.model(  # create a new user instance
            phone_number=phone_number,
            name=name,
            gender=gender,
            city=city,
        )
        user.set_password(password)  # hashes the password so it's never stored as plain text
        user.save(using=self._db)  # saves the user to the database
        return user

    def create_superuser(self, phone_number, name, gender, city, password):
        # this method creates a superuser (admin)
        user = self.create_user(phone_number, name, gender, city, password)
        user.is_staff = True    # gives access to admin panel
        user.is_superuser = True  # gives all permissions
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    # AbstractBaseUser gives us password hashing and auth methods
    # PermissionsMixin gives us is_superuser and permissions system

    # gender choices — only two options for now
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    # category choices — the 8 intent categories of Blunt
    CATEGORY_CHOICES = [
        ('hookup', 'Hookup'),
        ('hangout', 'Hangout'),
        ('smokeup', 'Smoke Up'),
        ('coffee', 'Coffee & Chill'),
        ('nightout', 'Night Out'),
        ('linkup', 'Link Up'),
        ('tripout', 'Trip Out'),
        ('workout', 'Workout'),
    ]

    # relationship type choices
    RELATIONSHIP_CHOICES = [
        ('monogamy', 'Monogamy'),
        ('non-monogamy', 'Non-Monogamy'),
    ]

    # religion choices
    RELIGION_CHOICES = [
        ('Hindu', 'Hindu'),
        ('Muslim', 'Muslim'),
        ('Sikh', 'Sikh'),
        ('Christian', 'Christian'),
        ('Buddhist', 'Buddhist'),
        ('Jain', 'Jain'),
        ('Atheist', 'Atheist'),
        ('Agnostic', 'Agnostic'),
        ('Other', 'Other'),
    ]

    # sexuality choices
    SEXUALITY_CHOICES = [
        ('Straight', 'Straight'),
        ('Gay', 'Gay'),
        ('Lesbian', 'Lesbian'),
        ('Bisexual', 'Bisexual'),
        ('Pansexual', 'Pansexual'),
        ('Asexual', 'Asexual'),
        ('Prefer Not To Say', 'Prefer Not To Say'),
    ]

    phone_number = models.CharField(max_length=15, unique=True)  # phone number is unique — one account per number
    name = models.CharField(max_length=100)  # user's display name
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)  # M or F
    city = models.CharField(max_length=100)  # city they live in
    description = models.TextField(blank=True)  # long text about themselves, optional at first
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)  # what they are looking for
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, blank=True)
    religion = models.CharField(max_length=20, choices=RELIGION_CHOICES, blank=True)
    sexuality = models.CharField(max_length=20, choices=SEXUALITY_CHOICES, blank=True)
    drugs = models.BooleanField(null=True, blank=True)
    smoke = models.BooleanField(null=True, blank=True)
    weed = models.BooleanField(null=True, blank=True)
    alcohol = models.BooleanField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)

    is_active = models.BooleanField(default=True)   # if False user is banned or deactivated
    is_staff = models.BooleanField(default=False)   # if True user can access admin panel
    is_verified = models.BooleanField(default=False)  # if True phone number has been verified via OTP
    is_profile_complete = models.BooleanField(default=False)  # if True user has filled all profile fields
    is_approved = models.BooleanField(default=False)  # set True by admin after reviewing profile
    created_at = models.DateTimeField(auto_now_add=True)  # automatically set when user is created
    updated_at = models.DateTimeField(auto_now=True)  # automatically updated every time user is saved

    objects = UserManager()  # attach our custom manager to this model

    USERNAME_FIELD = 'phone_number'  # use phone number instead of username for login
    REQUIRED_FIELDS = ['name', 'gender', 'city']  # fields required when creating superuser

    def __str__(self):
        return f"{self.name} ({self.phone_number})"  # how this user appears in admin panel and shell


class UserPhoto(models.Model):
    # stores up to 4 photos per user
    # separate model so we can add/remove photos independently

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='photos')  # links photo to user, deletes photos if user is deleted
    image = models.ImageField(upload_to='user_photos/', blank=True)  # local fallback
    cloudinary_image = models.CharField(max_length=500, blank=True)  # cloudinary public_id
    order = models.PositiveIntegerField(default=0)  # controls display order of photos (0 = first)
    uploaded_at = models.DateTimeField(auto_now_add=True)  # when this photo was uploaded

    class Meta:
        ordering = ['order']  # always return photos in order when queried

    def __str__(self):
        return f"Photo {self.order} of {self.user.name}"  # how photo appears in admin panel
    


class OTP(models.Model):
    # stores OTP codes for phone verification
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')  # links OTP to user, deletes OTPs if user is deleted
    code = models.CharField(max_length=6)  # the 6 digit OTP code
    created_at = models.DateTimeField(auto_now_add=True)  # when OTP was created
    expires_at = models.DateTimeField()  # when OTP expires
    is_used = models.BooleanField(default=False)  # whether OTP has been used already

    def save(self, *args, **kwargs):
        # automatically set expiry to 10 minutes from now when OTP is created
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=10)  # OTP expires in 10 minutes
        super().save(*args, **kwargs)  # call Django's default save method

    def is_valid(self):
        # checks if OTP is still valid
        return not self.is_used and timezone.now() < self.expires_at  # valid if not used and not expired

    @staticmethod
    def generate_code():
        # generates a random 6 digit OTP code
        return str(random.randint(100000, 999999))  # random number between 100000 and 999999

    def __str__(self):
        return f"OTP {self.code} for {self.user.phone_number}"  # how OTP appears in admin panel
    
class CategorySeat(models.Model):
    CATEGORY_CHOICES = [
        ('hookup', 'Hookup'),
        ('hangout', 'Hangout'),
        ('smokeup', 'Smoke Up'),
        ('coffee', 'Coffee & Chill'),
    ]

    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, unique=True)  # one row per category
    male_count = models.PositiveIntegerField(default=0)    # how many males currently in this category
    female_count = models.PositiveIntegerField(default=0)  # how many females currently in this category — this is also the male cap

    def male_seats_available(self):
        # males can only join if female count is greater than male count
        # this keeps ratio always equal
        return self.male_count < self.female_count

    def __str__(self):
        return f"{self.category} — {self.male_count}M / {self.female_count}F"