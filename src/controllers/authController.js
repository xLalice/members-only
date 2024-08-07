const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const pool = require("../db/pool");
const passport = require("passport");

exports.getSignupPage = (req, res) => {
  res.render("signup", {user: req.user});
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
      [firstName, lastName, email, hashedPassword]
    );
    res.redirect("/login");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

exports.getLoginPage = (req, res) => {
  res.render("login", {user: req.user, error: req.flash("error")});
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

exports.getJoinClubPage = (req, res) => {
  res.render("join-club", {user: req.user, error: req.query.error || null});
};

exports.joinClub = async (req, res) => {
  const { passcode } = req.body;
  if (passcode === process.env.CLUB_PASSCODE) { 
    try {
      await pool.query("UPDATE users SET is_member = TRUE WHERE id = $1", [
        req.user.id,
      ]);
      res.redirect("/");
    } catch (error) {
      res.render("join-club", {error: "Error updating user", user: req.user});
    }
  } else {
    res.render("join-club",{error: "Invalid passcode", user: req.user});
  }
};
