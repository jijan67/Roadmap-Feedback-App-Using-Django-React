from django.contrib import admin
from .models import RoadmapItem, Comment, Upvote

@admin.register(RoadmapItem)
class RoadmapItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'upvote_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'roadmap_item', 'parent', 'created_at']
    list_filter = ['created_at']

@admin.register(Upvote)
class UpvoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'roadmap_item', 'created_at']