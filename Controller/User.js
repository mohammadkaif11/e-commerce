const express = require("express");
const router = express.Router();
const userService = require("../Service/user.Service");
const SendEmail = require("../Service/email.Service");
const ResetPassword = require("../Service/ResetPasswordEmail.Service");

router.get("/signup", signUpView);
router.get("/login", loginView);
router.get("/logout", logout);
router.post("/signup", signUp);
router.post("/login", login);
router.get("/ChangePassword", ChangePasswordView);
router.post("/ChangePassword", ChangePassword);
router.get("/ChangeName", ChangeNameView);
router.post("/ChangeName", ChangeName);
router.get("/email", EmailPageView);
router.get("/VerifyEmail/:id", verfiyEmail);
router.get("/ForgetPasswordEmail", ForgetPasswordEmailView);
router.post("/ForgetPasswordEmail", ForgetPasswordEmail);
router.get("/ForgetPassword/:email", ForgetPasswordView);
router.post("/ForgetPassword/:email", ForgetPassword);

//ForgetPasswordView
function ForgetPasswordEmailView(req, res) {
  res.render("Login/ForgetPasswordEmail.ejs", { message: "" });
}

function ForgetPasswordEmail(req, res) {
  try {
    let email = req.body.Email;
    userService
      .CheckUserbyEmail(email)
      .then((data) => {
        if (data) {
          ResetPassword(data[0].Email, function (err, data) {
            if (err) {
              res.render("Login/ForgetPasswordEmail.ejs", {
                message: "Please check email",
              });
            } else {
              res.render("EmailView/EmailPage.ejs", {
                message: "forget password link have send",
              });
            }
          });
        } else {
          res.render("Login/ForgetPasswordEmail.ejs", {
            message: "doest not have account with email",
          });
        }
      })
      .catch((error) => {
        res.render("Login/ForgetPasswordEmail.ejs", {
          message: "Some thing Error",
        });
      });
  } catch (error) {
    res.render("Error/error.ejs");
  }
}

function ForgetPasswordView(req, res) {
  let email = req.params.email;
  res.render("Login/ForgetPassword.ejs", { message: "", email: email });
}

function ForgetPassword(req, res) {
  try {
    let email = req.params.email;
    if (req.body.Password != req.body.ConfirmPassword) {
      res.render("Login/ForgetPassword.ejs", {
        message: "Please Enter same Password",
        email: email,
      });
    } else {
      userService
        .UpdatePasswordbyEmail(email, req.body.Password)
        .then((data) => {
          res.render("Login/ForgetPassword.ejs", {
            message: "Password is Change",
            email: email,
          });
        })
        .catch((error) => {
          res.render("Login/ForgetPassword.ejs", { message: "", email: email });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

function EmailPageView(req, res, next) {
  res.render("EmailView/EmailPage.ejs", { message: "please verify your mail" });
}

function verfiyEmail(req, res, next) {
  try {
    let id = req.params.id;
    userService
      .VerfiyUser(id)
      .then((data) => {
        res.redirect("/user/login");
      })
      .catch((error) => {
        res.redirect("/user/signup");
      });
  } catch (error) {
    res.render("Error/error.ejs");
  }
}

function ChangePasswordView(req, res, next) {
  res.render("Profile/ChangePassword.ejs", {
    message: "",
    username: req.session.userName,
  });
}

function ChangePassword(req, res) {
  try {
    if (req.body.Password == "" || req.body.ConfirmPassword == "") {
      res.render("Profile/ChangePassword.ejs", {
        message: "Password and confirm Password is required field",
        username: req.session.userName,
      });
    } else if (req.body.Password != req.body.ConfirmPassword) {
      res.render("Profile/ChangePassword.ejs", {
        message: "Password and confirm Password is not  same",
        username: req.session.userName,
      });
    } else {
      let userId = req.session.userId;
      userService
        .ForgetPassword(req.body, userId)
        .then((data) => {
          res.redirect("/");
        })
        .catch((error) => {
          res.render("Profile/ChangePassword.ejs", {
            message: "Server error please try after sometimes",
            username: req.session.userName,
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

function ChangeNameView(req, res, next) {
  res.render("Profile/ChangeName.ejs", {
    message: "",
    username: req.session.userName,
  });
}

function ChangeName(req, res, next) {
  try {
    if (req.body.Name == "" || req.body.ChangeName == "") {
      res.render("Profile/ChangeName.ejs", {
        message: "Name and changeName is required filed",
        username: req.session.userName,
      });
    } else if (req.body.Name != req.body.ChangeName) {
      res.render("Profile/ChangeName.ejs", {
        message: "Name and changeName is not Same",
        username: req.session.userName,
      });
    } else {
      let userId = req.session.userId;
      userService
        .ForgetName(req.body, userId)
        .then((data) => {
          res.redirect("/");
        })
        .catch((error) => {
          res.render("Profile/ChangeName.ejs", {
            message: "Server error try after sometimes",
            username: req.session.userName,
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

function signUpView(req, res, next) {
  res.render("Signup/Signup.ejs", { message: "" });
}

function loginView(req, res, next) {
  res.render("Login/Login.ejs", { message: "" });
}

function signUp(req, res, next) {
  try {
    if (
      req.body.Name == "" ||
      req.body.Email == "" ||
      req.body.Password == ""
    ) {
      res.render("Signup/Signup.ejs", {
        message: "Name,email and password are required property",
      });
    } else {
      if (
        !req.body.Password.length >= 8 ||
        !IsValidPassword(req.body.Password)
      ) {
        let msg = PasswordValidationMsg();
        res.render("Signup/Signup.ejs", { message: msg });
      } else {
        userService
          .Register(req.body)
          .then((response) => {
            if (response != null) {
              SendEmail(response._id, response.Email, function (err, data) {
                if (err) {
                  res.render("Signup/Signup.ejs", {
                    message: "Please Check Email",
                  });
                } else {
                  res.redirect(`/user/email/`);
                }
              });
            } else {
              res.render("Signup/Signup.ejs", {
                message: "Please signup again",
              });
            }
          })
          .catch((error) => {
            res.render("Signup/Signup.ejs", {
              message: "Server error please check",
            });
          });
      }
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

function login(req, res, next) {
  try {
    if (req.body.Password == "" || req.body.Email == "") {
      res.render("Login/Login.ejs", {
        message: "Email and password is required Property",
      });
    } else {
      userService
        .Login(req.body)
        .then((response) => {
          console.log("Login response", response);
          if (response != null) {
            req.session.userId = response._id;
            req.session.userName = response.Name;
            if (response.IsVerify) {
              req.session.isVerify = true;
            } else {
              req.session.isVerify = false;
            }
            if (response.Role == "user") {
              req.session.role = "User";
              res.redirect("/");
            } else {
              req.session.role = "Admin";
              res.redirect("/Admin");
            }
          } else {
            res.render("Login/Login.ejs", {
              message: "Check email and password is correct or not",
            });
          }
        })
        .catch((error) => {
          res.render("Login/Login.ejs", {
            message: "Server error please check",
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

function logout(req, res, next) {
  req.session.destroy();
  res.redirect("/user/login");
}

//function Check Regularexpression with validpassword
function IsValidPassword(str) {
  var re = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9_])");

  return re.test(str);
}

function PasswordValidationMsg() {
  let str = `<ul> 
  <li>Password length must be greather 8</li>
  <li>One Number</li>
  <li>One uppercase at Least</li>
  <li>One lowercase at Least</li>
  <li>One special character at Least</li>
  </ul>`;
  return str;
}

module.exports = router;
