#Author : Jijanur Rahman
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxLengthValidator

class RoadmapItem(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    created_at = models.DateTimeField(auto_now_add=True)
    upvotes = models.ManyToManyField(User, through='Upvote', blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def upvote_count(self):
        return self.upvotes.count()

class Upvote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    roadmap_item = models.ForeignKey(RoadmapItem, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'roadmap_item')

class Comment(models.Model):
    roadmap_item = models.ForeignKey(RoadmapItem, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(validators=[MaxLengthValidator(300)])
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f'Comment by {self.user.username} on {self.roadmap_item.title}'
    
    @property
    def nesting_level(self):
        level = 0
        parent = self.parent
        while parent and level < 3:
            level += 1
            parent = parent.parent
        return level
    
    def can_have_replies(self):
        return self.nesting_level < 2