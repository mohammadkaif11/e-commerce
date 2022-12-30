const AdminRole = (req, res, next) => {
    if (req.session.userId !=null && req.session.role=="Admin") {
      next();
    } else {
      res.redirect("/user/login");
    }
  };
  
  module.exports=AdminRole;