const Booking = require('../models/Booking');
const Gig = require('../models/Gig');
const Transaction = require('../models/Transaction');

exports.createBooking = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.body.gigId);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancerId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot book your own gig' });
    }
    const booking = await Booking.create({
      gigId: gig._id,
      clientId: req.user.id,
      freelancerId: gig.freelancerId,
      amount: gig.price,
      status: 'confirmed'
    });
    await Transaction.create({ bookingId: booking._id, freelancerId: gig.freelancerId, amount: gig.price });
    return res.status(201).json({ message: 'Booking successful', booking });
  } catch (error) {
    return next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const filter = req.user.role === 'freelancer' ? { freelancerId: req.user.id } : { clientId: req.user.id };
    return res.json(await Booking.find(filter).populate('gigId', 'title description price'));
  } catch (error) {
    return next(error);
  }
};

exports.getMyTransactions = async (req, res, next) => {
  try {
    return res.json(await Transaction.find({ freelancerId: req.user.id }).populate('bookingId'));
  } catch (error) {
    return next(error);
  }
};
