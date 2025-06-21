// Author : Jijanur Rahman
import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { formatRelativeTime } from '../utils/dateUtils';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfileData(response.data);
      } catch (error) {
        setError('Failed to load profile data');
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">User Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Username:</span> {user.username}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Activity</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Total Comments:</span> {profileData?.comments?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Comments</h2>
        
        {profileData?.comments && profileData.comments.length > 0 ? (
          <div className="space-y-4">
            {profileData.comments.map(comment => (
              <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(comment.created_at)}
                    {comment.updated_at !== comment.created_at && (
                      <span className="ml-2">(edited)</span>
                    )}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{comment.content}</p>
                {comment.parent && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Reply to comment
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't made any comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;