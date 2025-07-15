import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from '../config';
import { 
  CheckCircle, 
  Users, 
  BarChart3, 
  Send, 
  ArrowRight,
  Clock,
  TrendingUp,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const POLL_TYPES = {
  MCQ: 'mcq',
  RATING: 'rating',
  YES_NO: 'yes_no',
  OPEN_TEXT: 'open_text'
};

const PollPage = () => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load poll data
    const fetchPoll = async () => {
      try {
        const response = await fetch(config.getApiUrl(`/polls/${pollId}`));
        if (response.ok) {
          const pollData = await response.json();
          setPoll(pollData);
          
          // Initialize responses
          const initialResponses = {};
          pollData.questions.forEach(question => {
            initialResponses[question.id] = '';
          });
          setResponses(initialResponses);
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

    // Setup Socket.IO connection
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

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleRatingClick = (questionId, rating) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: rating.toString()
    }));
  };

  const submitVote = async () => {
    // Check if all required questions are answered
    const unansweredQuestions = poll.questions.filter(q => 
      q.required && !responses[q.id]
    );

    if (unansweredQuestions.length > 0) {
      toast.error('Please answer all required questions');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const votePromises = poll.questions.map(question => {
        if (responses[question.id]) {
          return fetch(config.getApiUrl(`/polls/${pollId}/vote`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              questionId: question.id,
              answer: responses[question.id],
              voterId: localStorage.getItem(`voter_${pollId}`) || undefined
            }),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(votePromises);
      
      // Store voter ID to prevent multiple votes
      if (!localStorage.getItem(`voter_${pollId}`)) {
        localStorage.setItem(`voter_${pollId}`, `voter_${Date.now()}`);
      }
      
      setHasVoted(true);
      toast.success('Vote submitted successfully!');
      
      if (poll.settings.showResults) {
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case POLL_TYPES.MCQ:
        return (
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <label 
                key={optionIndex} 
                className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${
                  responses[question.id] === option 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                  responses[question.id] === option 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {responses[question.id] === option && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-gray-800 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case POLL_TYPES.RATING:
        const maxRating = question.options[0] === '1-10' ? 10 : 5;
        return (
          <div className="flex items-center justify-center space-x-2">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => handleRatingClick(question.id, num)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                  responses[question.id] === num.toString() 
                    ? 'bg-yellow-500 text-white shadow-lg scale-110' 
                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        );

      case POLL_TYPES.YES_NO:
        return (
          <div className="flex space-x-4">
            <button
              onClick={() => handleResponseChange(question.id, 'yes')}
              className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                responses[question.id] === 'yes' 
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <ThumbsUp className="h-5 w-5 mr-2" />
              <span className="font-medium">Yes</span>
            </button>
            <button
              onClick={() => handleResponseChange(question.id, 'no')}
              className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                responses[question.id] === 'no' 
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <ThumbsDown className="h-5 w-5 mr-2" />
              <span className="font-medium">No</span>
            </button>
          </div>
        );

      case POLL_TYPES.OPEN_TEXT:
        return (
          <textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          />
        );

      default:
        return null;
    }
  };

  const renderResults = (question) => {
    if (!question.results || Object.keys(question.results).length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No votes yet</p>
        </div>
      );
    }

    switch (question.type) {
      case POLL_TYPES.MCQ:
        const totalVotes = Object.values(question.results).reduce((a, b) => a + b, 0);
        return (
          <div className="space-y-4">
            {Object.entries(question.results).map(([option, votes]) => {
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              return (
                <div key={option} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-800">{option}</span>
                    <span className="text-blue-600">{votes} votes ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );

      case POLL_TYPES.RATING:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-1">
                {question.results.average?.toFixed(1) || '0'}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="space-y-3">
              {Object.entries(question.results.distribution || {}).map(([rating, count]) => (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-8">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{rating}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${(count / question.results.total) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="w-12 text-sm text-right font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case POLL_TYPES.YES_NO:
        const total = question.results.yes + question.results.no;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">
                  {question.results.yes}
                </div>
                <div className="text-sm text-gray-600">Yes</div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((question.results.yes / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                <ThumbsDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-600">
                  {question.results.no}
                </div>
                <div className="text-sm text-gray-600">No</div>
                <div className="text-xs text-gray-500">
                  {total > 0 ? ((question.results.no / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        );

      case POLL_TYPES.OPEN_TEXT:
        return (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {question.results.responses?.map((response, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl border-l-4 border-blue-500">
                <p className="text-gray-800 italic">"{response}"</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading your poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Poll Not Found</h1>
          <p className="text-gray-600 text-lg">The poll you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Poll Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{poll.title}</h1>
            {poll.description && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">{poll.description}</p>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{poll.totalVotes} votes</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium">{poll.questions.length} questions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* Questions */}
        {!hasVoted ? (
          <div className="space-y-6">
            {poll.questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {question.text}
                    </h3>
                    {question.required && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                
                {renderQuestion(question, index)}
              </div>
            ))}

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <button
                onClick={submitVote}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl text-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting Your Vote...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-3" />
                    Submit My Vote
                    <ArrowRight className="h-5 w-5 ml-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
            <p className="text-xl text-gray-600 mb-6">Your vote has been submitted successfully.</p>
            
            {poll.settings.showResults && (
              <button
                onClick={() => setShowResults(!showResults)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center mx-auto transition-all duration-200 transform hover:scale-105"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                {showResults ? 'Hide' : 'View'} Live Results
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="mt-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Live Results</h2>
              <p className="text-gray-600">See how others voted in real-time</p>
            </div>
            
            {poll.questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {question.text}
                  </h3>
                </div>
                {renderResults(question)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollPage; 