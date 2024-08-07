const express = require('express');
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { passport, isAuthenticated } = require("../middlewares/auth");
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/', messageController.getHomePage);

router.get("/signup", authController.getSignupPage);

router.post(
  "/signup",
  [
    body("firstname").notEmpty().trim().escape(),
    body("lastname").notEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match the password");
      }
      return true;
    }),
  ],
  authController.signup
);

router.get("/login", authController.getLoginPage);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/join-club", isAuthenticated, authController.getJoinClubPage);

router.post("/join-club", isAuthenticated, authController.joinClub);

module.exports = router;