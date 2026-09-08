exports.getDashboard = (req, res) => {
  res.json({
    message: 'Welcome to your dashboard!',
    user: req.user
  });
};
