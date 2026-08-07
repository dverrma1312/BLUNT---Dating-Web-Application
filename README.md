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
