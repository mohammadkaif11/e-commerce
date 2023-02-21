const CheckUserLogin = (req, res, next) => {
  if (req.session.userId != null) {
      if(req.session.isVerify){
        next();
      }
      else{
        res.render("EmailView/EmailPage.ejs", { message: "please verify your mail before logine we have already sended link" });
      }
  } else {
    res.redirect("/user/login");
  }
};


module.exports=CheckUserLogin;