const monk = require("monk");
const { nanoid } = require("nanoid");

const db = monk(process.env.MONGODB_URI);
const shortenUrls = db.get("shortenUrls");

shortenUrls.createIndex("originalURL");
shortenUrls.createIndex("shortURL");
shortenUrls.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

exports.shortURL = async (req, res) => {
  const _URL = req.body.url.trim();
  const shortURL = nanoid(7);

  try {
    if (!_URL) {
      return res.render("shortUrl", {
        errorMessage: null,
        successMessage: null,
        urls: urls,
        isLoggedIn: req.session.isLoggedIn,
        userName: req.session.user.name,
      });
    }

    new URL(_URL);

    const urlCount = await shortenUrls.count({
      user: req.session.user._id,
    });

    if (urlCount == 8)
      throw new Error("User can have maximum of 8 URLs only! 😕");

    const exists = await shortenUrls.findOne({
      originalURL: _URL,
      user: req.session.user._id,
    });

    if (exists) throw new Error("URL already exists! 😕");

    await shortenUrls.insert({
      originalURL: _URL,
      shortURL: shortURL,
      hitCount: 0,
      user: req.session.user._id,
    });

    const urls = await shortenUrls.find({
      user: req.session.user._id,
    });

    res.render("shortUrl", {
      successMessage: "URL Shorted Successfully",
      errorMessage: null,
      urls: urls,
      isLoggedIn: req.session.isLoggedIn,
      userName: req.session.user.name,
    });
  } catch (e) {
    const urls = await shortenUrls.find({
      user: req.session.user._id,
    });

    res.render("shortUrl", {
      errorMessage: e.message,
      successMessage: null,
      isLoggedIn: req.session.isLoggedIn,
      urls: urls,
      userName: req.session.user.name,
    });
  }
};

exports.getURL = async (req, res) => {
  try {
    const urlData = await shortenUrls.findOneAndUpdate(
      { shortURL: req.params.url },
      { $inc: { hitCount: 1 } },
      { returnOriginal: false }
    );

    if (!urlData) throw new Error("URL Not Found ! 😕");

    res.redirect(urlData.originalURL);
  } catch (e) {
    res.render("notFound", {
      message: e.message,
      errorMessage: null,
      successMessage: null,
      isLoggedIn: null,
    });
  }
};

exports.deleteURL = async (req, res) => {
  try {
    await shortenUrls.remove({
      user: req.session.user._id,
      shortURL: req.params.url,
    });

    res.redirect("/shortURL");
  } catch (e) {
    res.render("notFound", {
      message: e.message,
      errorMessage: null,
      successMessage: null,
      urls: [],
      isLoggedIn: null,
    });
  }
};
