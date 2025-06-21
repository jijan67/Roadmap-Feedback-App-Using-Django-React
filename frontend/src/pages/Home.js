// Author : Jijanur Rahman
import React, { useState, useEffect } from 'react';
import { roadmapAPI } from '../services/api';
import RoadmapCard from '../components/RoadmapCard';

const Home = ({ user }) => {
  const [roadmapItems, setRoadmapItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoadmapItems = async () => {
      setLoading(true);
      try {
        const response = await roadmapAPI.getRoadmapItems(sortBy);
        setRoadmapItems(response.data.results || response.data);
        setError('');
      } catch (error) {
        setError('Failed to load roadmap items');
        console.error('Error fetching roadmap items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapItems();
  }, [sortBy]);

  const handleUpvoteSuccess = () => {
    // Create a new fetch function inside the handler to avoid dependency issues
    const fetchUpdatedItems = async () => {
      try {
        const response = await roadmapAPI.getRoadmapItems(sortBy);
        setRoadmapItems(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching updated roadmap items:', error);
      }
    };
    fetchUpdatedItems();
  };

  // Fallback sort for 'Most Popular' in case backend or network returns unsorted data
  const sortedRoadmapItems = sortBy === 'popularity'
    ? [...roadmapItems].sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0) || new Date(b.created_at) - new Date(a.created_at))
    : roadmapItems;

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Roadmap</h1>
        <p className="text-gray-600 mb-6">
          View our product roadmap and share your feedback. Vote on features you'd like to see!
        </p>
        
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="created_at">Latest</option>
            <option value="popularity">Most Popular</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Only show error if there are no items */}
      {error && roadmapItems.length === 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {sortedRoadmapItems.length > 0 ? (
          sortedRoadmapItems.map(item => (
            <RoadmapCard
              key={item.id}
              item={item}
              user={user}
              onUpvoteSuccess={handleUpvoteSuccess}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No roadmap items found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;