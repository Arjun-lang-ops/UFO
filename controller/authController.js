export const googleAuthCallback = (req, res) => {
  try {
    req.session.userId = req.user._id;
    req.session.user = req.user._id;

    const redirectUrl = req.session.returnTo || '/home';
    delete req.session.returnTo;

    req.session.save(() => {
      res.redirect(redirectUrl);
    });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
};