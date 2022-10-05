const express = require("express");
const urlService = require("../services/urlService");
const router = express.Router();
const { isAuth } = require("../utils/authGuard");

router.post("/shortUrl", isAuth, urlService.shortURL);
router.get("/delete/:url", isAuth, urlService.deleteURL);
router.get("/:url", urlService.getURL);

module.exports = router;
