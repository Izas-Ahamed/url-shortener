module.exports.isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) return res.redirect("/");
  next();
};

module.exports.isNotAuth = (req, res, next) => {
  if (req.session.isLoggedIn) return res.redirect("/shortUrl");
  next();
};
