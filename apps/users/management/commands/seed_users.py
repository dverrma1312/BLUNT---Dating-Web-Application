import random
from django.core.management.base import BaseCommand
from apps.users.models import User, CategorySeat

# sample data
FEMALE_NAMES = [
    "Aanya", "Priya", "Riya", "Sneha", "Kavya", "Ishita", "Nisha", "Pooja",
    "Simran", "Divya", "Mehak", "Tanvi", "Shreya", "Ananya", "Komal", "Sana",
    "Radhika", "Neha", "Tanya", "Aditi", "Zara", "Kiara", "Rhea", "Isha",
    "Naina", "Sakshi", "Ankita", "Deepika", "Ayesha", "Payal", "Swati",
    "Anjali", "Kritika", "Muskan", "Pallavi", "Diya", "Nidhi", "Monika",
    "Sunaina", "Lavanya", "Gauri", "Mansi", "Jyoti", "Alisha", "Harleen",
    "Ridhima", "Jasmine", "Sonam", "Chanchal", "Reena"
]

MALE_NAMES = [
    "Arjun", "Rohan", "Vikram", "Aarav", "Karan", "Dev", "Siddharth", "Rahul",
    "Nikhil", "Aditya", "Sahil", "Varun", "Kunal", "Ankit", "Harsh", "Yash",
    "Kabir", "Ishaan", "Rishi", "Pranav", "Dhruv", "Vivek", "Gaurav", "Amit",
    "Shubham", "Tarun", "Neeraj", "Akash", "Mohit", "Sumit", "Ajay", "Vijay",
    "Manish", "Rajat", "Deepak", "Abhishek", "Aman", "Kartik", "Parth", "Laksh"
]

CITIES = ["Delhi", "Gurgaon", "Noida", "Mumbai", "Bangalore", "Pune", "Hyderabad"]

CATEGORIES = ["hookup", "hangout", "smokeup", "coffee"]

DESCRIPTIONS = [
    "here for a good time not a long time",
    "let's skip the small talk",
    "spontaneous and always down for something new",
    "night owl looking for good company",
    "i make terrible decisions really well",
    "bored of the same old routine",
    "up for whatever tonight brings",
    "talk to me about music and food",
    "professional overthinker, amateur adventurer",
    "if you're interesting i'll make time",
    "let's grab a drink and see where it goes",
    "here because my friends dared me to",
    "tell me something i don't know",
    "mostly harmless",
    "weekend energy on a weeknight",
]


class Command(BaseCommand):
    help = 'Seeds 10 female and 10 male fake users for testing'

    def handle(self, *args, **kwargs):
        created = 0

        # create females — only first 10
        for i, name in enumerate(FEMALE_NAMES[:10]):
            phone = f"9900{str(i).zfill(6)}"  # unique phone like 990000000, 990000001...
            category = random.choice(CATEGORIES)

            if User.objects.filter(phone_number=phone).exists():
                continue  # skip if already exists

            user = User.objects.create_user(
                phone_number=phone,
                name=name,
                gender='F',
                city=random.choice(CITIES),
                password='testpass123',
            )
            user.category = category
            user.description = random.choice(DESCRIPTIONS)
            user.is_verified = True
            user.is_approved = True
            user.is_profile_complete = True
            user.save()

            # update category seat count
            seat, _ = CategorySeat.objects.get_or_create(category=category)
            seat.female_count += 1
            seat.save()

            created += 1

        self.stdout.write(f"Created {created} female users")
        created = 0

        # create males — only first 10
        for i, name in enumerate(MALE_NAMES[:10]):
            phone = f"9800{str(i).zfill(6)}"  # different prefix so no collision with females
            category = random.choice(CATEGORIES)

            if User.objects.filter(phone_number=phone).exists():
                continue

            # check ratio gate before creating male
            seat, _ = CategorySeat.objects.get_or_create(category=category)
            if not seat.male_seats_available():
                # try another category
                for cat in CATEGORIES:
                    seat, _ = CategorySeat.objects.get_or_create(category=cat)
                    if seat.male_seats_available():
                        category = cat
                        break
                else:
                    self.stdout.write(f"Skipping {name} — no male seats available in any category")
                    continue

            user = User.objects.create_user(
                phone_number=phone,
                name=name,
                gender='M',
                city=random.choice(CITIES),
                password='testpass123',
            )
            user.category = category
            user.description = random.choice(DESCRIPTIONS)
            user.is_verified = True
            user.is_approved = True
            user.is_profile_complete = True
            user.save()

            seat.male_count += 1
            seat.save()

            created += 1

        self.stdout.write(f"Created {created} male users")
        self.stdout.write(self.style.SUCCESS("Seeding done!"))