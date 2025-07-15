import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from '../config';
import { 
  Users, 
  Download, 
  Copy, 
  TrendingUp,
  Clock,
  QrCode,
  ArrowLeft
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

const AdminPage = () => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(config.getApiUrl(`/polls/${pollId}`));
        if (response.ok) {
          const pollData = await response.json();
          setPoll(pollData);
        } else {
          toast.error('Poll not found');
        }
      } catch (error) {
        console.error('Error fetching poll:', error);
        toast.error('Failed to load poll');
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const exportCSV = async () => {
    try {
      const response = await fetch(config.getApiUrl(`/polls/${pollId}/export/csv`));
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `poll-${pollId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('CSV exported successfully!');
      } else {
        toast.error('Failed to export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const generateQRCode = () => {
    const pollUrl = `${window.location.origin}/poll/${pollId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pollUrl)}`;
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
          <div className="space-y-4">
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
          <div className="space-y-4">
            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600">
                  {question.results.average?.toFixed(1) || '0'}
                </div>
              <div className="text-sm text-gray-600">Average Rating</div>
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
        const yesNoData = [
          { name: 'Yes', value: question.results.yes, fill: '#10b981' },
          { name: 'No', value: question.results.no, fill: '#ef4444' }
        ];

        return (
          <div className="space-y-4">
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
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {question.results.responses?.map((response, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                "{response}"
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
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Poll Not Found</h1>
        <p className="text-gray-600">The poll you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const pollUrl = `${window.location.origin}/poll/${pollId}`;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          to="/admin"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{poll.title}</h1>
            {poll.description && (
              <p className="text-gray-600 mb-4">{poll.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
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
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="btn-secondary"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </button>
            <button
              onClick={() => copyToClipboard(pollUrl)}
              className="btn-secondary"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </button>
            <button
              onClick={exportCSV}
              className="btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <img 
                src={generateQRCode()} 
                alt="QR Code" 
                className="mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">
                Scan this QR code to access the poll
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Poll Link */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-3">Poll Link</h2>
        <div className="flex">
          <input
            type="text"
            value={pollUrl}
            readOnly
            className="input-field rounded-r-none"
          />
          <button
            onClick={() => copyToClipboard(pollUrl)}
            className="btn-primary rounded-l-none px-4"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Share this link with your audience to collect votes
        </p>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Live Results</h2>
        
        {poll.questions.map((question, index) => (
          <div key={question.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Question {index + 1}: {question.text}
              </h3>
              <div className="text-sm text-gray-500">
                {question.responses?.length || 0} responses
              </div>
            </div>
            
            {renderChart(question)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage; 