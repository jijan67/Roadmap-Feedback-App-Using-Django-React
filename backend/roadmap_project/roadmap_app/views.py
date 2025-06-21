#Author : Jijanur Rahman
from django.db import models
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import RoadmapItem, Comment, Upvote
from .serializers import (
    RoadmapItemSerializer, CommentSerializer, UpvoteSerializer, 
    RegisterSerializer, UserSerializer
)
from django.views.decorators.csrf import ensure_csrf_cookie

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if email and password:
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
        if user:
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    return Response({
        'error': 'Email and password required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user_comments = Comment.objects.filter(user=request.user)
    return Response({
        'user': UserSerializer(request.user).data,
        'comments': CommentSerializer(user_comments, many=True, context={'request': request}).data
    })

class RoadmapItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RoadmapItem.objects.all()
    serializer_class = RoadmapItemSerializer
    
    def get_queryset(self):
        queryset = RoadmapItem.objects.all()
        sort_by = self.request.query_params.get('sort', 'created_at')
        
        if sort_by == 'popularity':
            # Sort by upvote count
            queryset = queryset.annotate(
                upvote_count=models.Count('upvotes')
            ).order_by('-upvote_count', '-created_at')
        elif sort_by == 'status':
            queryset = queryset.order_by('status', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        roadmap_id = self.kwargs['roadmap_id']
        return Comment.objects.filter(roadmap_item_id=roadmap_id, parent=None)
    
    def perform_create(self, serializer):
        roadmap_id = self.kwargs['roadmap_id']
        roadmap_item = RoadmapItem.objects.get(id=roadmap_id)
        serializer.save(user=self.request.user, roadmap_item=roadmap_item)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(user=self.request.user)

class UpvoteCreateView(generics.CreateAPIView):
    serializer_class = UpvoteSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@ensure_csrf_cookie
def csrf_token_view(request):
    return Response({'message': 'CSRF cookie set'})