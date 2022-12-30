const CheckUserLogin = (req, res, next) => {
  if (req.session.userId != null) {
      if(req.session.isVerify){
        next();
      }
      else{
        res.render("EmailView/EmailPage.ejs",{message:`<a href=user/VerifyEmail/${req.session.userId}>Click the below linkt to verify </a>`});
      }
  } else {
    res.redirect("/user/login");
  }
};


module.exports=CheckUserLogin;