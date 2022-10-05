const express = require("express");
const viewService = require("../services/viewService");
const { isAuth, isNotAuth } = require("../utils/authGuard");
const router = express.Router();

router.get("/", isNotAuth, viewService.home);
router.get("/login", isNotAuth, viewService.login);
router.get("/logout", viewService.logout);
router.get("/signup", isNotAuth, viewService.signup);
router.get("/shortUrl", isAuth, viewService.shortUrl);

module.exports = router;
