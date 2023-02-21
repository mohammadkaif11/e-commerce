const express = require("express");
const router = express.Router();
const userService = require("../Service/user.Service");
const SendEmail = require("../Service/email.Service");
const ResetPassword = require("../Service/ResetPasswordEmail.Service");
const CheckUserLogin=require('../Middleware/UserLogin')

router.get("/signup", signUpView);
router.post("/signup", signUp);
router.get("/login", loginView);
router.post("/login", login);
router.get("/logout", logout);
router.get("/ChangePassword",CheckUserLogin, ChangePasswordView);
router.post("/ChangePassword",CheckUserLogin, ChangePassword);
router.get("/ChangeName",CheckUserLogin, ChangeNameView);
router.post("/ChangeName",CheckUserLogin, ChangeName);
router.get("/email", EmailPageView);
router.get("/VerifyEmail/:id", verfiyEmail);
router.get("/ForgetPasswordEmail", ForgetPasswordEmailView);
router.post("/ForgetPasswordEmail", ForgetPasswordEmail);
router.get("/ForgetPassword/:userId", ForgetPasswordView);
router.post("/ForgetPassword/:userId", ForgetPassword);


//Admin Login and sigup
router.get("/adminsignup", AdminSignUpView);
router.post("/adminsignup", AdminSignUp);
router.get("/adminlogin", AdminLoginView);
router.post("/adminlogin",login);


function AdminSignUpView(req,res){
  res.render("Admin/Signup.ejs", { message: "",isValidation:true});
}

function AdminSignUp(req,res){
  try {
    if (
      req.body.Name == "" ||
      req.body.Email == "" ||
      req.body.Password == ""
    ) {
      res.render("Signup/Signup.ejs", {
        message: "Name,email and password are required property",
        isValidation:true
      });
    } else {
      if (
        !req.body.Password.length >= 8 ||
        !IsValidPassword(req.body.Password)
      ) {
        let msg = PasswordValidationMsg();
        res.render("Signup/Signup.ejs", { message: msg ,isValidation:true});
      } else {
        userService
          .RegisterAdmin(req.body)
          .then((response) => {
            if (response != null) {
              SendEmail(response.userId, response.Email, function (err, data) {
                if (err) {
                  res.render("Signup/Signup.ejs", {
                    message: "Email service have some error",
                    isValidation:true
                  });
                } else {
                  res.redirect(`/user/email/`);
                }
              });
            } else {
              res.render("Signup/Signup.ejs", {
                message: "User exits with same email",
                isValidation:true
              });
            }
          })
          .catch((error) => {
            res.render("Signup/Signup.ejs", {
              message: "Server error please check",
              isValidation:true
            });
          });
      }
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

function AdminLoginView(req,res){
  res.render("Admin/Login.ejs", { message: "",isValidation:true});
}

////////////////////

//ForgetPassoword Email View without LoginUser
function ForgetPasswordEmailView(req, res) {
  res.render("Login/ForgetPasswordEmail.ejs", { message: "",isValidation:true });
}

//ForgetPassword Email Post without LoginUser Verify user and send email
function ForgetPasswordEmail(req, res) {
  try {
    let email = req.body.Email;
    userService
      .CheckUserbyEmail(email)
      .then((data) => {
        if (data) {
          ResetPassword(data[0].Email,data[0].userId, function (err, data) {
            if (err) {
              res.render("Login/ForgetPasswordEmail.ejs", {
                message: "Email service down try after sometimes",
                isValidation:true
              });
            } else {
              res.render("EmailView/EmailPage.ejs", {
                message: "Forget password link have send",
              });
            }
          });
        } else {
          res.render("Login/ForgetPasswordEmail.ejs", {
            message: "doest not have account with email",
            isValidation:true
          });
        }
      })
      .catch((error) => {
        res.render("Login/ForgetPasswordEmail.ejs", {
          message: "Some thing Error",
          isValidation:true
        });
      });
  } catch (error) {
    res.render("Error/error.ejs");
  }
}


//ForgetPassword View by link using unique email
function ForgetPasswordView(req, res) {
  const userId = req.params.userId;
  const {GetUserByuserId}=userService;
  GetUserByuserId(userId).then((data)=>{
    res.render("Login/ForgetPassword.ejs", { message: "", Id:data.userId,isValidation:true});
  }).catch((error)=>{
    res.render("Login/ForgetPassword.ejs", { message: "Some error", Id:"randomId",isValidation:true});
  })
}

//ForgetPassword post method by link using unique email
function ForgetPassword(req, res) {
  try {
    const userId = req.params.userId;
      if(req.body.Password != req.body.ConfirmPassword){
      res.render("Login/ForgetPassword.ejs", { message: "Please enter same password", Id:userId,isValidation:true});
      } else if(!req.body.Password.length >= 8 ||
      !IsValidPassword(req.body.Password)){
        let msg = PasswordValidationMsg();
        res.render("Login/ForgetPassword.ejs", { message: msg, Id:userId,isValidation:true});
      }else{
      const {UpdatePasswordbyEmail} =userService;
       UpdatePasswordbyEmail(userId,req.body.Password).then((data)=>{
        res.render("Login/Login.ejs", {
          message: "Success user password is change",
          isValidation:false
        });
        
       }).catch((error)=>{
        res.render("Login/Login.ejs", {
          message: "Try again later",
          isValidation:false
        });
        
       })
      }
  } catch (error) {
    console.log(error)
    res.render("Error/error.ejs");
  }
}

//VerfiyEmailView after singup
function EmailPageView(req, res, next) {
  res.render("EmailView/EmailPage.ejs", { message: "please verify your mail we have sended link" });
}

//VerfiyEmail Function after singup
function verfiyEmail(req, res, next) {
  try {
    //unique userId
    let userId = req.params.id;
    userService
      .VerfiyUser(userId)
      .then((data) => {
        res.render("Login/Login.ejs", {
          message: "Success user is verify",
          isValidation:false
        });
      })
      .catch((error) => {
        res.redirect("/user/signup");
      });
  } catch (error) {
    res.render("Error/error.ejs");
  }
}

//ChangePasswordView With LoginUser
function ChangePasswordView(req, res, next) {
  res.render("Profile/ChangePassword.ejs", {
    message: "",
    username: req.session.userName,
  });
}

//ChangePasswordView post With LoginUser
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
    } else if(!req.body.Password.length >= 8 ||
      !IsValidPassword(req.body.Password)){
        let msg = PasswordValidationMsg();
        res.render("Profile/ChangePassword.ejs", {
          message: msg,
          username: req.session.userName,
        });
       }
    else {
      let userId = req.session.userId;
      userService
        .ForgetPassword(req.body, userId)
        .then((data) => {
          req.session=null;
          res.render("Login/Login.ejs", {
            message: "Password change successfully",
            isValidation:false
          });
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

//ChangeNameView with login User
function ChangeNameView(req, res) {
  res.render("Profile/ChangeName.ejs", {
    message: "",
    username: req.session.userName,
  });
}

//ChangeNameView post with login User
function ChangeName(req, res) {
  try {
    console.log(req.body);
    if (req.body.Name == "" || req.body.ConfirmName == "") {
      res.render("Profile/ChangeName.ejs", {
        message: "Name and changeName is required filed",
        username: req.session.userName,
      });
    } else if (req.body.Name != req.body.ConfirmName) {
      res.render("Profile/ChangeName.ejs", {
        message: "Name and changeName is not same",
        username: req.session.userName,
      });
    } else {
      let userId = req.session.userId;
      userService
        .ForgetName(req.body, userId)
        .then((data) => {
          req.session=null;
          res.render("Login/Login.ejs", {
            message: "Name change successfully",
            isValidation:false
          });
        })
        .catch((error) => {
          console.log(error);
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

//Signup View
function signUpView(req, res, next) {
  res.render("Signup/Signup.ejs", { message: "",isValidation:true});
}

//Signup post Function
function signUp(req, res, next) {
  try {
    if (
      req.body.Name == "" ||
      req.body.Email == "" ||
      req.body.Password == ""
    ) {
      res.render("Signup/Signup.ejs", {
        message: "Name,email and password are required property",
        isValidation:true
      });
    } else {
      if (
        !req.body.Password.length >= 8 ||
        !IsValidPassword(req.body.Password)
      ) {
        let msg = PasswordValidationMsg();
        res.render("Signup/Signup.ejs", { message: msg ,isValidation:true});
      } else {
        userService
          .Register(req.body)
          .then((response) => {
            if (response != null) {
              SendEmail(response.userId, response.Email, function (err, data) {
                if (err) {
                  res.render("Signup/Signup.ejs", {
                    message: "Email service have some error",
                    isValidation:true
                  });
                } else {
                  res.redirect(`/user/email/`);
                }
              });
            } else {
              res.render("Signup/Signup.ejs", {
                message: "User exits with same email",
                isValidation:true
              });
            }
          })
          .catch((error) => {
            res.render("Signup/Signup.ejs", {
              message: "Server error please check",
              isValidation:true
            });
          });
      }
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//login View
function loginView(req, res, next) {
  res.render("Login/Login.ejs", { message: "",isValidation:true });
}

//login PostMethod
function login(req, res, next) {
  try {
    if (req.body.Password == "" || req.body.Email == "") {
      res.render("Login/Login.ejs", {
        message: "Email and password is required Property",
        isValidation:true
      });
    } else {
      userService
        .Login(req.body)
        .then((response) => {
          if (response != null) {
            req.session.userId = response.userId;
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
              message: "Crendials are invalid",
              isValidation:true
            });
          }
        })
        .catch((error) => {
          res.render("Login/Login.ejs", {
            message: "Server error please check",
            isValidation:true
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.render("Error/error.ejs");
  }
}

//logout
function logout(req, res, next) {
  req.session=null;  
  res.redirect("/user/login");
}

//helper function
//function Check Regularexpression with validpassword
function IsValidPassword(str) {
  var re = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9_])");

  return re.test(str);
}

//Password Return Message
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
