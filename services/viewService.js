const monk = require("monk");
const db = monk(
  "mongodb+srv://root:root@urlsh.2dxmg1b.mongodb.net/?retryWrites=true&w=majority"
);
const shortenUrls = db.get("shortenUrls");
exports.home = (req, res) => {
  res.render("home", {
    errorMessage: null,
    successMessage: null,
    isLoggedIn: null,
  });
};

exports.login = (req, res) => {
  res.render("login", {
    errorMessage: null,
    successMessage: null,
    email: null,
    password: null,
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.signup = (req, res) => {
  res.render("signup", {
    errorMessage: null,
    successMessage: null,
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
    isLoggedIn: null,
  });
};

exports.shortUrl = async (req, res) => {
  try {
    const urls = await shortenUrls.find({
      user: req.session.user._id,
    });

    res.render("shortUrl", {
      errorMessage: null,
      successMessage: null,
      urls: urls,
      isLoggedIn: req.session.isLoggedIn,
      userName: req.session.user.name,
    });
  } catch (e) {
    res.render("shortUrl", {
      errorMessage: e.message,
      successMessage: null,
      urls: [],
      isLoggedIn: req.session.isLoggedIn,
      userName: req.session.user.name,
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => res.redirect("/"));
};
