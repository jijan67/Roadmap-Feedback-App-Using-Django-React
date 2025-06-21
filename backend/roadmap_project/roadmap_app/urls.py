from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'roadmap', views.RoadmapItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('roadmap/<int:roadmap_id>/comments/', views.CommentListCreateView.as_view(), name='roadmap-comments'),
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    path('upvote/', views.UpvoteCreateView.as_view(), name='upvote'),
    path('csrf/', views.csrf_token_view, name='csrf-token'),
]