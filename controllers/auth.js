const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const newPassword = require("../util/newPassword");
const authEmail = require('../util/authEmail')

var transporter = nodemailer.createTransport(authEmail);

exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash("error");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render("auth/login", {
    pageTitle: "Đăng nhập",
    errorMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "email");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              const url = req.headers.referer.split("=")[1];
              if (url !== undefined) {
                res.redirect("/" + url);
              } else {
                res.redirect("/");
              }
            });
          }
          req.flash("error", "password");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let notify = req.flash("notify");
  if (notify.length > 0) {
    notify = notify[0];
  } else {
    notify = null;
  }
  res.render("auth/signup", {
    pageTitle: "Đăng ký",
    errorMessage: null,
    notify,
    oldInput: {
      userName: "",
      numberPhone: "",
      email: "",
    },
    errorMessageEV: []
  });
};

exports.postSignup = (req, res, next) => {
  const { decentralization, userName, numberPhone, email } = req.body;
  const password = newPassword(8);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Đăng ký",
      notify: null,
      errorMessage: null,
      errorMessageEV: errors.array(),
      oldInput: {
        userName: req.body.userName,
        numberPhone: req.body.numberPhone,
        email: req.body.email,
      },
    });
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.status(422).render("auth/signup", {
          pageTitle: "Đăng ký",
          notify: null,
          errorMessage: "Email đã tồn tại",
          oldInput: {
            userName: req.body.userName,
            numberPhone: req.body.numberPhone,
            email: req.body.email,
          },
          errorMessageEV: []
        });
      }
      return bcrypt
        .hash(password, 12)
        .then((hashPassword) => {
          const user = new User({
            decentralization,
            image: 'images/noavatar.png',
            userName,
            numberPhone,
            email,
            password: hashPassword,
            address: "",
            active: false,
          });
          return user.save();
        })
        .then((result) => {
          req.flash("notify", email);
          res.redirect("/signup");
          console.log("Mật khẩu đăng ký là:", password);
          transporter.sendMail({
            to: email,
            from: "charity.nodejs@gmail.com",
            subject: "Đăng ký thành công tài khoàn tại Charity",
            html: `<p>Mật khẩu của bạn là ${password}</p>`,
          });
        });
    })
    .catch((err) => {
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  let notify = req.flash("notify");
  if (notify.length > 0) {
    notify = notify[0];
  } else {
    notify = null;
  }
  res.render("auth/reset", {
    pageTitle: "Quên mật khẩu",
    errorMessage: null,
    notify,
  });
};

exports.postReset = (req, res, next) => {
  const password = newPassword(8);
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.render("auth/reset", {
          pageTitle: "Quên mật khẩu",
          errorMessage: "Không tìm thấy tài khoản với Email đó",
          notify: null,
        });
      }
      return bcrypt
        .hash(password, 12)
        .then((hashPassword) => {
          user.password = hashPassword;
          return user.save();
        })
        .then((result) => {
          console.log("Mật khẩu mới:", password);
          req.flash("notify", email);
          res.redirect("/reset");
          transporter.sendMail({
            to: email,
            from: "charity.nodejs@gmail.com",
            subject: "Mật khẩu mới ",
            html: `<p>Mật khẩu mới của bạn là ${password}"></p>`,
          });
        });
    })
    .catch((err) => {
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);;
    });
};

exports.getNewPassword = async (req, res, next) => {
  const user = await User.findById(req.session.user._id);

  let notify = req.flash("notify");
  if (notify.length > 0) {
    notify = notify[0];
  } else {
    notify = null;
  }

  res.render("auth/new-password", {
    path: "/new-password",
    pageTitle: "Thay đổi mật khẩu",
    user,
    notify,
    errorMessage: null,
    oldInput: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
};

exports.postNewPassword = async (req, res, next) => {
  const user = await User.findById(req.session.user._id);
  const password = req.body.password;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  let resetUser;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/new-password", {
      pageTitle: "Thay đổi mật khẩu",
      user,
      notify: null,
      errorMessage: null,
      errorMessageEV: errors.array(),
      oldInput: {
        password: password,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      },
    });
  }

  User.findById(req.session.user._id).then((user) => {
    resetUser = user;
    bcrypt
      .compare(password, resetUser.password) // So sánh mật khẩu hiện tại
      .then((doMatch) => {
        if (doMatch === false) {
          req.flash("error", "Mật khẩu hiện tại không đúng");
          return res.status(422).render("auth/new-password", {
            pageTitle: "Thay đổi mật khẩu",
            user,
            notify: null,
            errorMessage: req.flash("error"),
            oldInput: {
              password: password,
              newPassword: newPassword,
              confirmPassword: confirmPassword,
            },
          });
        }
        bcrypt
          .hash(newPassword, 12)
          .then((hashedPassword) => {
            user.password = hashedPassword;
            return user.save();
          })
          .then((user) => {
            req.flash("notify", "Thay đổi mật khẩu thành công");
            res.redirect("/detail-user/new-password");
          })
          .catch((err) => {
            console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);;
          });
      })
      .catch((err) => {
        console.log(err)
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);;
      });
  });
};
