const Composition = require('../models/Composition');

// Get all public compositions
exports.getPublicCompositions = async (req, res) => {
  try {
    const compositions = await Composition.find({ isPublic: true })
      .select('title creator createdAt')
      .sort({ createdAt: -1 });
    res.json(compositions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get composition by ID
exports.getCompositionById = async (req, res) => {
  try {
    const composition = await Composition.findById(req.params.id);
    if (!composition) {
      return res.status(404).json({ message: 'Composition not found' });
    }
    res.json(composition);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new composition
exports.createComposition = async (req, res) => {
  try {
    const newComposition = new Composition({
      title: req.body.title || 'Untitled Composition',
      creator: req.body.creator,
      notes: req.body.notes || [],
      bpm: req.body.bpm || 120,
      isPublic: req.body.isPublic
    });

    const savedComposition = await newComposition.save();
    res.status(201).json(savedComposition);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// Update composition
exports.updateComposition = async (req, res) => {
  try {
    const composition = await Composition.findById(req.params.id);
    
    if (!composition) {
      return res.status(404).json({ message: 'Composition not found' });
    }
    
    // Update fields
    if (req.body.title) composition.title = req.body.title;
    if (req.body.notes) composition.notes = req.body.notes;
    if (req.body.bpm) composition.bpm = req.body.bpm;
    if (req.body.isPublic !== undefined) composition.isPublic = req.body.isPublic;
    
    const updatedComposition = await composition.save();
    res.json(updatedComposition);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// Delete composition
exports.deleteComposition = async (req, res) => {
  try {
    const composition = await Composition.findById(req.params.id);
    
    if (!composition) {
      return res.status(404).json({ message: 'Composition not found' });
    }
    
    await composition.remove();
    res.json({ message: 'Composition removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};