const Gig = require('../models/Gig');

exports.createGig = async (req, res, next) => {
  try {
    const gig = await Gig.create({ ...req.body, freelancerId: req.user.id });
    return res.status(201).json({ message: 'Gig created', gig });
  } catch (error) {
    return next(error);
  }
};

exports.getGigs = async (req, res, next) => {
  try {
    return res.json(await Gig.find().populate('freelancerId', 'email'));
  } catch (error) {
    return next(error);
  }
};

exports.updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own gigs' });
    }
    const updatedGig = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return res.json({ message: 'Gig updated', gig: updatedGig });
  } catch (error) {
    return next(error);
  }
};

exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own gigs' });
    }
    await gig.deleteOne();
    return res.json({ message: 'Gig deleted' });
  } catch (error) {
    return next(error);
  }
};
