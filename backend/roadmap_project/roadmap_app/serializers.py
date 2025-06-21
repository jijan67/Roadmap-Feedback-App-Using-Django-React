# Author : Jijanur Rahman
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import RoadmapItem, Comment, Upvote

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    nesting_level = serializers.ReadOnlyField()
    roadmap_item = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'user', 'parent', 'created_at', 'updated_at', 'replies', 'can_edit', 'nesting_level', 'roadmap_item']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.nesting_level < 2:
            replies = obj.replies.all()
            return CommentSerializer(replies, many=True, context=self.context).data
        return []
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.user
    
    def validate_content(self, value):
        if len(value) > 300:
            raise serializers.ValidationError("Comment cannot exceed 300 characters")
        return value
    
    def validate_parent(self, value):
        if value and value.nesting_level >= 2:
            raise serializers.ValidationError("Cannot reply to comments nested more than 2 levels deep")
        return value

class RoadmapItemSerializer(serializers.ModelSerializer):
    upvote_count = serializers.ReadOnlyField()
    user_has_upvoted = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = RoadmapItem
        fields = ['id', 'title', 'description', 'status', 'created_at', 'upvote_count', 'user_has_upvoted', 'comments']
    
    def get_upvote_count(self, obj):
        # Use annotated value if present, else fallback to model property
        return getattr(obj, 'upvote_count', obj.upvote_count)
    
    def get_user_has_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(id=request.user.id).exists()
        return False
    
    def get_comments(self, obj):
        # Only get top-level comments (no parent)
        top_level_comments = obj.comments.filter(parent=None)
        return CommentSerializer(top_level_comments, many=True, context=self.context).data

class UpvoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upvote
        fields = ['roadmap_item']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        upvote, created = Upvote.objects.get_or_create(**validated_data)
        if not created:
            raise serializers.ValidationError("You have already upvoted this item")
        return upvote