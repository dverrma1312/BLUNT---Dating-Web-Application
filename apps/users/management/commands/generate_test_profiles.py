import random
from datetime import date
from django.core.management.base import BaseCommand
from apps.users.models import User, CategorySeat
from apps.intent.models import UserIntent


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

CITIES = ["Chandigarh", "Mohali", "Gurgaon", "Noida", "Delhi"]

CATEGORIES = ["hookup", "hangout", "smokeup", "coffee", "nightout", "linkup", "tripout", "workout"]

RELATIONSHIP_TYPES = ["Monogamy", "Non-Monogamy"]

RELIGIONS = ["Hindu", "Muslim", "Sikh", "Christian", "Buddhist", "Jain", "Atheist", "Agnostic", "Other"]

SEXUALITIES = ["Straight", "Gay", "Lesbian", "Bisexual", "Pansexual", "Asexual"]

DESCRIPTIONS = [
    "Here for a good time not a long time",
    "Let's skip the small talk",
    "Spontaneous and always down for something new",
    "Night owl looking for good company",
    "I make terrible decisions really well",
    "Bored of the same old routine",
    "Up for whatever tonight brings",
    "Talk to me about music and food",
    "Professional overthinker, amateur adventurer",
    "If you're interesting I'll make time",
    "Let's grab a drink and see where it goes",
    "Here because my friends dared me to",
    "Tell me something I don't know",
    "Mostly harmless",
    "Weekend energy on a weeknight",
]

PLANS = [
    "Down to hang",
    "No plans yet",
    "Let's figure it out",
    "Got something in mind",
    "Free tonight",
]

FLEXIBILITIES = ["Fixed", "I Don't Know", "Up To You"]


class Command(BaseCommand):
    help = 'Creates 20 fake test profiles with all profile fields'

    def handle(self, *args, **kwargs):
        # Delete existing test users with phone numbers starting with +9170000
        deleted = User.objects.filter(phone_number__startswith='+9170000').delete()[0]
        if deleted > 0:
            self.stdout.write(f"Deleted {deleted} existing test users")

        created = 0
        start_number = 7000000001  # +9170000000X

        # Create 10 females
        for i, name in enumerate(FEMALE_NAMES[:10]):
            phone = f"+91{start_number + i}"
            category = random.choice(CATEGORIES)

            if User.objects.filter(phone_number=phone).exists():
                self.stdout.write(f"Skipping {phone} — already exists")
                continue

            user = User(
                phone_number=phone,
                name=name,
                gender='F',
                city=random.choice(CITIES),
            )
            user.set_unusable_password()
            user.category = category
            user.relationship_type = random.choice(RELATIONSHIP_TYPES)
            user.religion = random.choice(RELIGIONS)
            user.sexuality = random.choice(SEXUALITIES)
            user.drugs = random.choice([True, False])
            user.smoke = random.choice([True, False])
            user.weed = random.choice([True, False])
            user.alcohol = random.choice([True, False])
            user.dob = date(random.randint(1995, 2003), random.randint(1, 12), random.randint(1, 28))
            user.description = random.choice(DESCRIPTIONS)
            user.is_active = True
            user.is_verified = True
            user.is_profile_complete = True
            user.is_approved = True
            user.save()

            # Update category seat count
            seat, _ = CategorySeat.objects.get_or_create(category=category)
            seat.female_count += 1
            seat.save()

            # Create daily intent for user
            UserIntent.objects.create(
                user=user,
                what_are_you_doing=random.choice(PLANS),
                looking_for=category,
                plan_flexibility=random.choice(FLEXIBILITIES),
            )

            created += 1
            self.stdout.write(f"Created female: {name} ({phone})")

        self.stdout.write(f"Created {created} female users")
        intents_created = created  # track intents created
        created = 0

        # Create 10 males
        for i, name in enumerate(MALE_NAMES[:10]):
            phone = f"+91{start_number + 10 + i}"
            category = random.choice(CATEGORIES)

            if User.objects.filter(phone_number=phone).exists():
                self.stdout.write(f"Skipping {phone} — already exists")
                continue

            # Check ratio gate before creating male
            seat, _ = CategorySeat.objects.get_or_create(category=category)
            if not seat.male_seats_available():
                for cat in CATEGORIES:
                    seat, _ = CategorySeat.objects.get_or_create(category=cat)
                    if seat.male_seats_available():
                        category = cat
                        break
                else:
                    self.stdout.write(f"Skipping {name} — no male seats available")
                    continue

            user = User(
                phone_number=phone,
                name=name,
                gender='M',
                city=random.choice(CITIES),
            )
            user.set_unusable_password()
            user.category = category
            user.relationship_type = random.choice(RELATIONSHIP_TYPES)
            user.religion = random.choice(RELIGIONS)
            user.sexuality = random.choice(SEXUALITIES)
            user.drugs = random.choice([True, False])
            user.smoke = random.choice([True, False])
            user.weed = random.choice([True, False])
            user.alcohol = random.choice([True, False])
            user.dob = date(random.randint(1995, 2003), random.randint(1, 12), random.randint(1, 28))
            user.description = random.choice(DESCRIPTIONS)
            user.is_active = True
            user.is_verified = True
            user.is_profile_complete = True
            user.is_approved = True
            user.save()

            seat.male_count += 1
            seat.save()

            # Create daily intent for user
            UserIntent.objects.create(
                user=user,
                what_are_you_doing=random.choice(PLANS),
                looking_for=category,
                plan_flexibility=random.choice(FLEXIBILITIES),
            )

            created += 1
            self.stdout.write(f"Created male: {name} ({phone})")

        self.stdout.write(f"Created {created} male users")
        total_intents = intents_created + created
        self.stdout.write(self.style.SUCCESS(f"Done! Created {total_intents} users and {total_intents} intents."))