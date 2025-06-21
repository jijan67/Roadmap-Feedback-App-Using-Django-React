import React, { useState } from 'react';
import { upvoteAPI } from '../services/api';
import { formatRelativeTime } from '../utils/dateUtils';
import CommentSection from './CommentSection';

const RoadmapCard = ({ item, user, onUpvoteSuccess }) => {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshComments, setRefreshComments] = useState(0);

  const getStatusColor = (status) => {
    const colors = {
      planned: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.planned;
  };

  const getStatusText = (status) => {
    const texts = {
      planned: 'Planned',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return texts[status] || 'Planned';
  };

  const handleUpvote = async () => {
    if (!user) {
      setMessage('Please log in to upvote');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsUpvoting(true);
    try {
      await upvoteAPI.upvoteItem(item.id);
      setMessage('Upvoted successfully!');
      onUpvoteSuccess();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to upvote');
      console.error('Upvote error:', error, error.response);
    } finally {
      setIsUpvoting(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Add a handler to refresh comments after any comment action
  const handleCommentUpdate = () => {
    setRefreshComments((prev) => prev + 1);
    if (typeof onUpvoteSuccess === 'function') {
      onUpvoteSuccess(); // This will refetch roadmap items in Home.js
    }
  };

  // Helper function to count all comments and replies
  const countAllComments = (comments) => {
    if (!comments) return 0;
    let count = 0;
    for (const comment of comments) {
      count += 1;
      if (comment.replies && comment.replies.length > 0) {
        count += countAllComments(comment.replies);
      }
    }
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {item.title}
          </h3>
          <p className="text-gray-600 mb-3">{item.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                item.status
              )}`}
            >
              {getStatusText(item.status)}
            </span>
            <span>{formatRelativeTime(item.created_at)}</span>
          </div>
        </div>

        <div className="flex flex-col items-center ml-6">
          <button
            onClick={handleUpvote}
            disabled={isUpvoting || (user && item.user_has_upvoted)}
            className={`p-2 rounded-full transition-colors ${
              item.user_has_upvoted
                ? 'bg-blue-600 text-white cursor-not-allowed'
                : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'
            } ${isUpvoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-900 mt-1">
            {item.upvote_count}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showComments
            ? 'Hide Comments'
            : `Show Comments (${countAllComments(item.comments)})`}
        </button>

        {showComments && (
          <CommentSection
            roadmapId={item.id}
            comments={item.comments}
            user={user}
            key={refreshComments} // force re-mount to refresh
            onCommentUpdate={handleCommentUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default RoadmapCard;