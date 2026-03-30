export const googleAuthCallback = (req, res) => {
  try {
    req.session.userId = req.user._id;
    req.session.user = req.user._id;

    req.session.save(() => {
      res.redirect('/home');
    });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
};