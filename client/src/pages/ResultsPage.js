import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from '../config';
import { 
  BarChart3, 
  Users, 
  Clock,
  TrendingUp,
  Share2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

const POLL_TYPES = {
  MCQ: 'mcq',
  RATING: 'rating',
  YES_NO: 'yes_no',
  OPEN_TEXT: 'open_text'
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const ResultsPage = () => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(config.getApiUrl(`/polls/${pollId}/results`));
        if (response.ok) {
          const pollData = await response.json();
          setPoll(pollData);
        } else {
          toast.error('Poll not found');
        }
      } catch (error) {
        console.error('Error fetching poll results:', error);
        toast.error('Failed to load poll results');
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();

    // Setup Socket.IO connection for real-time updates
    const newSocket = io(config.getSocketUrl());
    setSocket(newSocket);

    newSocket.emit('joinPoll', pollId);

    newSocket.on('pollUpdate', (data) => {
      if (data.pollId === pollId) {
        setPoll(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            questions: prev.questions.map(q => 
              q.id === data.questionId 
                ? { ...q, results: data.results }
                : q
            ),
            totalVotes: data.totalVotes
          };
        });
      }
    });

    return () => {
      newSocket.emit('leavePoll', pollId);
      newSocket.disconnect();
    };
  }, [pollId]);

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: poll.title,
        text: `Check out the results for: ${poll.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Results link copied to clipboard!');
    }
  };

  const renderChart = (question) => {
    if (!question.results || Object.keys(question.results).length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data available yet
        </div>
      );
    }

    switch (question.type) {
      case POLL_TYPES.MCQ:
        const mcqData = Object.entries(question.results).map(([option, votes], index) => ({
          name: option,
          votes,
          fill: COLORS[index % COLORS.length]
        }));

        return (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mcqData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="votes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mcqData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="votes"
                >
                  {mcqData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case POLL_TYPES.RATING:
        const ratingData = Object.entries(question.results.distribution || {}).map(([rating, count]) => ({
          rating: parseInt(rating),
          count
        })).sort((a, b) => a.rating - b.rating);

        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {question.results.average?.toFixed(1) || '0'}
              </div>
              <div className="text-lg text-gray-600">Average Rating</div>
              <div className="text-sm text-gray-500 mt-1">
                Based on {question.results.total || 0} responses
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case POLL_TYPES.YES_NO:
        const total = question.results.yes + question.results.no;
        const yesNoData = [
          { name: 'Yes', value: question.results.yes, fill: '#10b981' },
          { name: 'No', value: question.results.no, fill: '#ef4444' }
        ];

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {question.results.yes}
                </div>
                <div className="text-lg text-gray-600">Yes</div>
                <div className="text-sm text-gray-500">
                  {total > 0 ? ((question.results.yes / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">
                  {question.results.no}
                </div>
                <div className="text-lg text-gray-600">No</div>
                <div className="text-sm text-gray-500">
                  {total > 0 ? ((question.results.no / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={yesNoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {yesNoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );



      case POLL_TYPES.OPEN_TEXT:
        return (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {question.results.responses?.map((response, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Response {index + 1}</div>
                <div className="text-gray-900">"{response}"</div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h1>
        <p className="text-gray-600">The poll results you're looking for don't exist or have been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{poll.title}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{poll.totalVotes} total votes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>{poll.questions.length} questions</span>
              </div>
            </div>
                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
               <div className="flex items-center space-x-2">
                 <BarChart3 className="h-5 w-5 text-blue-600" />
                 <span className="text-blue-800 font-medium">Live Results Dashboard</span>
               </div>
               <p className="text-blue-700 text-sm mt-1">
                 Results update in real-time as new votes come in
               </p>
             </div>
          </div>
          
          <button
            onClick={shareResults}
            className="btn-primary"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Results
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-8">
        {poll.questions.map((question, index) => (
          <div key={question.id} className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Question {index + 1}: {question.text}
              </h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {question.totalResponses || 0} responses
              </div>
            </div>
            
            {renderChart(question)}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500">
        <p>Results powered by Live Polling Platform</p>
        <p className="text-sm mt-1">Results update automatically as new votes are submitted</p>
      </div>
    </div>
  );
};

export default ResultsPage; 