const mongoose = require('mongoose');

const CompositionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: String,
    required: true
  },
  notes: {
    type: Array,
    default: []
  },
  bpm: {
    type: Number,
    default: 120
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  collaborators: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Generate a unique shareable URL
CompositionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.shareableUrl = `${this._id}-${this.title.toLowerCase().replace(/\s+/g, '-')}`;
  }
  next();
});

module.exports = mongoose.model('Composition', CompositionSchema);