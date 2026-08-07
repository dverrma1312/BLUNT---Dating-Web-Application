# Blunt 2.0 — Category-Based Dating Web Application

Blunt 2.0 is a modern, real-time dating web application designed to connect users based on their immediate, category-specific intentions. Built with a high-performance **Django** backend and a responsive **React** frontend, Blunt balances category gender ratios and uses automated scheduled pools to ensure quality interactions.

---

## 🚀 Key Features

* **Intent-Based Matching:** Users select specific categories representing their current mood or intent:
  * 💬 **Hangout**
  * ☕ **Coffee & Chill**
  * 💨 **Smoke Up**
  * 🔥 **Hookup**
* **Ratio-Balanced Seating:** Implements a dynamic gender-ratio balancing system per category to maintain healthy match pools.
* **Daily Pools (Celery Beat):** Discovery feeds are generated as daily pools starting at **8:00 AM IST** every day.
* **Daily Expiry:** To promote active engagement, matches and connection requests automatically expire daily at **midnight IST**.
* **OTP Authentication:** Secure, passwordless authentication using mobile phone numbers and OTP verification.
* **Real-Time Chat:** Low-latency instant messaging powered by **WebSockets (Django Channels)**.

---

## 🛠️ Tech Stack

### **Backend**
* **Framework:** Django 6.0 & Django REST Framework (DRF)
* **Real-time Engine:** Django Channels (WebSockets)
* **Task Queue & Scheduler:** Celery & Celery Beat (using Redis as a broker)
* **Database:** PostgreSQL
* **Caching & Broker:** Redis
* **Media Storage:** Cloudinary (for profile photos)
* **Static Files:** WhiteNoise

### **Frontend**
* **Library:** React 19
* **Routing:** React Router
* **API Client:** Axios
* **WebSockets:** Browser WebSocket API for real-time messaging

---

## 📂 Repository Structure
 ├── backend/ # Django backend project │ ├── config/ # Settings and configuration (base, dev, prod) │ ├── users/ # Auth, profile, OTP, photos, ratio-balancing │ ├── intent/ # Intent selection and category seats │ ├── discovery/ # Pool generation and discovery feed logic │ ├── connections/ # Match management and request lifecycles │ ├── conversation/ # Real-time WebSocket chat handlers │ └── manage.py │ └── frontend/ # React frontend project ├── src/ # React source files ├── public/ # Static assets ├── package.json └── tailwind.config.js # Styling configuration

 
---
🛠️ Tech Stack


Backend
Framework: Django 6.0 & Django REST Framework (DRF)
Real-time Engine: Django Channels (WebSockets)
Task Queue & Scheduler: Celery & Celery Beat (using Redis as a broker)
Database: PostgreSQL
Caching & Broker: Redis
Media Storage: Cloudinary (for profile photos)
Static Files: WhiteNoise
Frontend
Library: React 19
Routing: React Router
API Client: Axios
WebSockets: Browser WebSocket API for real-time messaging


📂 Repository Structure

├── backend/                  # Django backend project
│   ├── config/               # Settings and configuration (base, dev, prod)
│   ├── users/                # Auth, profile, OTP, photos, ratio-balancing
│   ├── intent/               # Intent selection and category seats
│   ├── discovery/            # Pool generation and discovery feed logic
│   ├── connections/          # Match management and request lifecycles
│   ├── conversation/         # Real-time WebSocket chat handlers
│   └── manage.py
│
└── frontend/                 # React frontend project
    ├── src/                  # React source files
    ├── public/               # Static assets
    ├── package.json
    └── tailwind.config.js    # Styling configuration

    
⚙️ Setup & Installation

Prerequisites
Make sure you have the following installed locally:

Python 3.10+
Node.js 18+
PostgreSQL
Redis Server
Backend Setup
Navigate to backend and create a virtual environment:

bash

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install dependencies:

bash

pip install -r requirements.txt
Configure Environment Variables: Create a .env file in the backend/ directory (see .env.example for reference):

env

SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/blunt_db
REDIS_URL=redis://127.0.0.1:6379/0
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
Run database migrations:

bash

python manage.py makemigrations
python manage.py migrate
Start the development server:

bash

python manage.py runserver
Start Celery Worker & Beat (in separate terminals):

bash

# Start Celery Worker
celery -A config worker -l info
# Start Celery Beat Scheduler
celery -A config beat -l info
Frontend Setup
Navigate to the frontend directory:

bash

cd ../frontend
Install dependencies:

bash

npm install
Configure API connection: Configure your environment variables or backend base URL in src/utils/axios.js (pointing to your running backend at http://127.0.0.1:8000).

Start the React development server:

bash

npm start
🔗 API Endpoint Reference
Endpoint	HTTP Method	Description
/api/users/register/	POST	Register a new user profile
/api/users/login/	POST	Request an OTP verification code
/api/users/verify-otp/	POST	Verify OTP and receive JWT Token
/api/intent/select/	POST	Update user intent and category seat
/api/discovery/feed/	GET	Retrieve daily discovery pool
/api/connections/match/	POST/GET	Send connection requests / list active matches
/api/conversation/	GET	Retrieve list of chat conversations


🗓️ Scheduled Workflows


Daily Pool Generation (8:00 AM IST): Runs the generate-daily-pools task to match users and populate their feeds for the day.
Match Expiration (Midnight IST): Runs the expire-matches task to clear active connections, encouraging users to connect intentionally and promptly.
