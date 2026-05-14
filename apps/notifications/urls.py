from django.urls import path
from .views import NotificationListView, NotificationMarkReadView, NotificationMarkAllReadView, NotificationCountView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications'),
    path('count/', NotificationCountView.as_view(), name='notification-count'),
    path('mark-read/<int:notification_id>/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
]