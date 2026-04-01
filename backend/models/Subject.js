const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  vid: { type: String, required: true },
  notes: { type: String, default: "#" },
  pyq: { type: String, default: "#" }
});

const ChapterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topics: [TopicSchema]
});

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  chapters: [ChapterSchema]
});

module.exports = mongoose.model('Subject', SubjectSchema);
