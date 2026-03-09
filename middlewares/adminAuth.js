export const adminLoggedIn = (req, res, next) => {
     if (req.session.admin) {
          return res.redirect('/admin/home');
     }
     next();
};