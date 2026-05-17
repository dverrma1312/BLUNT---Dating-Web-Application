



# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blunt is a Django + React dating app with category-based matching. Users sign up with phone number + OTP, select a category (Hookup, Hangout, Smoke Up, Coffee & Chill), and get matched within their category based on gender ratio balance.

## Architecture

**Backend (Django 6.0)**
- Django REST Framework for APIs
- Custom User model using phone number as username
- JWT authentication via djangorestframework_simplejwt
- Real-time chat via Django Channels (WebSockets)
- Celery for async tasks
- PostgreSQL database
- Redis for caching and WebSocket message broker
- Cloudinary for image storage
- WhiteNoise for static file serving

**Frontend (React 19)**
- React Router for navigation
- Axios for API calls
- WebSocket consumer for real-time chat

**Django Apps**
- `users` - User authentication, profiles, OTP verification, category seat management
- `intent` - User's category selection and intent description
- `discovery` - Pool generation and discovery feed (daily pools at 8am IST)
- `connections` - Match management and connection requests (expires daily at midnight)
- `conversation` - Real-time chat via WebSockets

## Commands

```bash
# Backend - run Django server
python manage.py runserver

# Backend - run database migrations
python manage.py migrate
python manage.py makemigrations

# Backend - create superuser
python manage.py createsuperuser

# Backend - Celery worker (for async tasks)
celery -A config worker -l info

# Backend - Celery beat (for scheduled tasks)
celery -A config beat -l info

# Frontend - run React dev server
cd frontend && npm start

# Frontend - build for production
cd frontend && npm run build
```

**Prerequisites**: PostgreSQL and Redis must be running locally.

## URL Structure

| Path | App | Purpose |
|------|-----|---------|
| `/admin` | Django admin | Admin panel |
| `/api/users/` | users | Auth, profile, OTP, photos |
| `/api/intent/` | intent | Category selection |
| `/api/discovery/` | discovery | Pool, discovery feed |
| `/api/connections/` | connections | Match/connection management |
| `/api/conversation/` | conversation | Real-time chat |

## Settings

- `config/settings/development.py` - Local development (SQLite fallback available)
- `config/settings/production.py` - Production on Railway
- `config/settings/base.py` - Shared settings

Environment variables in `.env` (never commit this file).

## Key Models

- `User` - Custom user with phone_number as USERNAME_FIELD, category selection, verification status
- `UserPhoto` - Up to 4 photos per user (local + Cloudinary)
- `OTP` - Phone verification codes (10 min expiry)
- `CategorySeat` - Tracks male/female counts per category for ratio balancing
- `UserIntent` - User's current category and intent text
- `Match` - Connections between users with expiry
- `Conversation` / `Message` - Real-time chat models

## Scheduled Tasks (Celery Beat)

- `generate-daily-pools` - Runs daily at 8am IST to generate discovery pools
- `expire-matches` - Runs daily at midnight IST to expire old matches


## Critical Rules

- NEVER suggest deleting database records, migrations, or any production data unless the user explicitly asks to delete something specific.
- NEVER suggest `Model.objects.all().delete()` or any bulk delete command as a debugging step.
- When bypassing time gates for testing, only comment out the relevant condition in the view — never touch data.
- After writing any styles object, run: `grep -n "sans-serif'," src/pages/MyProfile.jsx` and fix any broken fontFamily quotes before finishing.


## Known Bugs To Fix
- axios.js baseURL hardcoded to 127.0.0.1:8000 — must use env variable
- All image URLs hardcoded with 127.0.0.1:8000 across frontend pages
- cursor:none in index.css breaks mobile/touch devices
- DM Serif Display used in styles but never imported in index.css
- Match avatar in Discovery.jsx navigates to /questions/${match.id} — route doesn't accept id param
- alert() used for match notification — replace with toast
- Discovery layout is desktop only — no mobile responsiveness