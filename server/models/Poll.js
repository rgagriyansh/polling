const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'rating', 'yes_no', 'open_text'],
    required: true
  },
  options: [{
    type: String
  }],
  required: {
    type: Boolean,
    default: true
  },
  responses: [{
    id: String,
    answer: String,
    voterId: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questions: [questionSchema],
  settings: {
    allowMultipleVotes: {
      type: Boolean,
      default: false
    },
    showResults: {
      type: Boolean,
      default: true
    },
    expirationTime: {
      type: Date,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update results when responses change
pollSchema.methods.updateResults = function() {
  this.questions.forEach(question => {
    switch (question.type) {
      case 'mcq':
        question.results = {};
        question.responses.forEach(response => {
          const answer = response.answer;
          question.results[answer] = (question.results[answer] || 0) + 1;
        });
        break;
        
      case 'rating':
        const ratings = question.responses.map(r => parseInt(r.answer));
        if (ratings.length > 0) {
          question.results = {
            average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
            total: ratings.length,
            distribution: {}
          };
          ratings.forEach(rating => {
            question.results.distribution[rating] = (question.results.distribution[rating] || 0) + 1;
          });
        }
        break;
        
      case 'yes_no':
        question.results = { yes: 0, no: 0 };
        question.responses.forEach(response => {
          const answer = response.answer.toLowerCase();
          if (answer === 'yes' || answer === 'true') {
            question.results.yes++;
          } else {
            question.results.no++;
          }
        });
        break;
        
      case 'open_text':
        question.results = {
          responses: question.responses.map(r => r.answer),
          total: question.responses.length
        };
        break;
    }
  });
  
  this.totalVotes = this.questions.reduce((total, q) => total + q.responses.length, 0);
};

module.exports = mongoose.model('Poll', pollSchema); 