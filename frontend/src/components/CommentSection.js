import React, { useState, useEffect } from 'react';
import { commentAPI } from '../services/api';
import { formatRelativeTime } from '../utils/dateUtils';

const Comment = ({ comment, user, roadmapId, fetchComments, level = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [message, setMessage] = useState('');

  const canReply = level < 2;
  const indentClass = level > 0 ? `ml-${level * 8}` : '';

  const handleEdit = async () => {
    try {
      await commentAPI.updateComment(comment.id, { content: editContent });
      setIsEditing(false);
      setMessage('Comment edited successfully');
      fetchComments(); // Fetch latest comments
    } catch (error) {
      setMessage('Failed to edit comment');
      console.error('Edit comment error:', error, error.response);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentAPI.deleteComment(comment.id);
        setMessage(''); // Remove message after delete
        fetchComments(); // Fetch latest comments
      } catch (error) {
        setMessage('Failed to delete comment');
        console.error('Delete comment error:', error, error.response);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleReply = async () => {
    try {
      await commentAPI.createComment(comment.roadmap_item, {
        content: replyContent,
        parent: comment.id
      });
      setReplyContent('');
      setIsReplying(false);
      setMessage('Reply added successfully');
      fetchComments(); // Fetch latest comments
    } catch (error) {
      setMessage('Failed to reply');
      console.error('Reply comment error:', error, error.response);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className={`${indentClass} ${level > 0 ? 'border-l-2 border-gray-200 pl-4' : ''}`}>
      {message && (
        <div className={`mb-2 p-2 rounded text-sm ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
      
      <div className="bg-gray-50 rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{comment.user.username}</span>
            <span className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
          
          {comment.can_edit && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={300}
              className="w-full p-2 border rounded-md resize-none"
              rows="3"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {editContent.length}/300 characters
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-700">{comment.content}</p>
        )}
        
        {canReply && user && !isEditing && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-xs"
          >
            Reply
          </button>
        )}
        
        {isReplying && (
          <div className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              maxLength={300}
              className="w-full p-2 border rounded-md resize-none"
              rows="2"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {replyContent.length}/300 characters
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {comment.replies && comment.replies.map(reply => (
        <Comment
          key={reply.id}
          comment={reply}
          user={user}
          roadmapId={roadmapId}
          fetchComments={fetchComments}
          level={level + 1}
        />
      ))}
    </div>
  );
};

const CommentSection = ({ roadmapId, comments: initialComments, user }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch latest comments from backend
  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(roadmapId);
      setComments(response.data);
    } catch (error) {
      setMessage('Failed to load comments');
    }
  };

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  const handleSubmitComment = async () => {
    if (!user) {
      setMessage('Please log in to comment');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setIsSubmitting(true);
    try {
      await commentAPI.createComment(roadmapId, { content: newComment });
      setNewComment('');
      setMessage('Comment added successfully');
      fetchComments();
    } catch (error) {
      setMessage('Failed to add comment');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="mt-4">
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
      {user && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            maxLength={300}
            className="w-full p-3 border rounded-md resize-none"
            rows="3"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {newComment.length}/300 characters
            </span>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              user={user}
              roadmapId={roadmapId}
              fetchComments={fetchComments}
            />
          ))
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;