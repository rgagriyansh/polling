import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { Plus, Trash2, Eye, Save, Copy, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const POLL_TYPES = {
  MCQ: 'mcq',
  RATING: 'rating',
  YES_NO: 'yes_no',
  OPEN_TEXT: 'open_text'
};

const POLL_TYPE_LABELS = {
  [POLL_TYPES.MCQ]: 'Multiple Choice',
  [POLL_TYPES.RATING]: 'Rating Scale',
  [POLL_TYPES.YES_NO]: 'Yes/No',
  [POLL_TYPES.OPEN_TEXT]: 'Open Text'
};

const CreatePollPage = () => {
  const navigate = useNavigate();
  const [pollData, setPollData] = useState({
    title: '',
    description: '',
    questions: [
      {
        id: 1,
        text: '',
        type: POLL_TYPES.MCQ,
        options: ['Option 1', 'Option 2'],
        required: true
      }
    ],
    settings: {
      allowMultipleVotes: false,
      showResults: true,
      expirationTime: null
    }
  });

  const [createdPoll, setCreatedPoll] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: POLL_TYPES.MCQ,
      options: ['Option 1', 'Option 2'],
      required: true
    };
    setPollData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId) => {
    if (pollData.questions.length > 1) {
      setPollData(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId)
      }));
    }
  };

  const updateQuestion = (questionId, field, value) => {
    setPollData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const addOption = (questionId) => {
    setPollData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, `Option ${q.options.length + 1}`]
          };
        }
        return q;
      })
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setPollData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.options.length > 2) {
          return {
            ...q,
            options: q.options.filter((_, index) => index !== optionIndex)
          };
        }
        return q;
      })
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setPollData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const createPoll = async () => {
    if (!pollData.title.trim()) {
      toast.error('Please enter a poll title');
      return;
    }

    if (pollData.questions.some(q => !q.text.trim())) {
      toast.error('Please fill in all question texts');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(config.getApiUrl('/polls'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      });

      const result = await response.json();
      
      if (result.success) {
        setCreatedPoll(result);
        toast.success('Poll created successfully!');
      } else {
        toast.error('Failed to create poll');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  if (createdPoll) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Poll Created Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your poll is now live and ready to receive votes.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poll Link (for participants)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={createdPoll.pollLink}
                  readOnly
                  className="input-field rounded-r-none"
                />
                <button
                  onClick={() => copyToClipboard(createdPoll.pollLink)}
                  className="btn-primary rounded-l-none px-3"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Link (for you)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={createdPoll.adminLink}
                  readOnly
                  className="input-field rounded-r-none"
                />
                <button
                  onClick={() => copyToClipboard(createdPoll.adminLink)}
                  className="btn-primary rounded-l-none px-3"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(`/admin/${createdPoll.pollId}`)}
              className="btn-primary"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Admin Panel
            </button>
            <button
              onClick={() => navigate(`/poll/${createdPoll.pollId}`)}
              className="btn-secondary"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Test Poll
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Poll</h1>
        <p className="text-gray-600">Design your poll with multiple question types and real-time results.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Poll Builder */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Poll Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Title *
                </label>
                <input
                  type="text"
                  value={pollData.title}
                  onChange={(e) => setPollData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter poll title"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={pollData.description}
                  onChange={(e) => setPollData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter poll description"
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                onClick={addQuestion}
                className="btn-primary text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {pollData.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      Question {index + 1}
                    </span>
                    {pollData.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        placeholder="Enter your question"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                        className="input-field"
                      >
                        {Object.entries(POLL_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Options for MCQ */}
                    {question.type === POLL_TYPES.MCQ && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Options
                          </label>
                                                     <button
                             onClick={() => addOption(question.id)}
                             className="text-blue-600 hover:text-blue-700 text-sm"
                           >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </button>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="input-field flex-1"
                              />
                              {question.options.length > 2 && (
                                <button
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating scale options */}
                    {question.type === POLL_TYPES.RATING && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating Scale
                        </label>
                        <select
                          value={question.options[0] || '1-5'}
                          onChange={(e) => updateQuestion(question.id, 'options', [e.target.value])}
                          className="input-field"
                        >
                          <option value="1-5">1 to 5</option>
                          <option value="1-10">1 to 10</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pollData.settings.showResults}
                  onChange={(e) => setPollData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, showResults: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Show results to participants</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pollData.settings.allowMultipleVotes}
                  onChange={(e) => setPollData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, allowMultipleVotes: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Allow multiple votes per device</span>
              </label>
            </div>
          </div>

          <button
            onClick={createPoll}
            disabled={isCreating}
            className="btn-primary w-full py-3 text-lg"
          >
            {isCreating ? 'Creating Poll...' : 'Create Poll'}
          </button>
        </div>

        {/* Preview */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {pollData.title || 'Untitled Poll'}
              </h3>
              {pollData.description && (
                <p className="text-gray-600 text-sm mb-4">{pollData.description}</p>
              )}
            </div>

            {pollData.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">
                  {index + 1}. {question.text || 'Question text'}
                </h4>
                
                {question.type === POLL_TYPES.MCQ && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="poll-option">
                        <input type="radio" name={`question-${question.id}`} className="mr-2" />
                        {option}
                      </div>
                    ))}
                  </div>
                )}



                {question.type === POLL_TYPES.RATING && (
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button key={num} className="poll-option w-12 h-12 flex items-center justify-center">
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === POLL_TYPES.YES_NO && (
                  <div className="flex space-x-4">
                    <div className="poll-option flex-1 text-center">Yes</div>
                    <div className="poll-option flex-1 text-center">No</div>
                  </div>
                )}

                {question.type === POLL_TYPES.OPEN_TEXT && (
                  <textarea
                    placeholder="Type your response..."
                    rows={3}
                    className="input-field"
                    disabled
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePollPage; 