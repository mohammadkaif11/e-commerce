const Users = require("../DataContext/DataBaseModel/Usermodel");

async function Register(data) {
  var checkUser = await Users.findOne({ Email: data.Email });
  if (checkUser != null) {
    return null;
  }
  var user = new Users({
    Name: data.Name,
    Email: data.Email,
    Password: data.Password,
    Role:"user",
    IsVerify:false
  });
  var data = await user.save();
  return data;
}

async function Login(data) {
  var data = await Users.findOne({
    Email: data.Email,
    Password: data.Password,
  });
  return data;
}

async function ForgetPassword(data,userId){
    var data= await Users.findByIdAndUpdate(userId,{Password:data.Password});
    return data;
}

async function ForgetName(data,userId){
 var data= await Users.findByIdAndUpdate(userId,{Name:data.Name});
 return data;
}

async function VerfiyUser(userId){
  var data= await Users.findByIdAndUpdate(userId,{IsVerify:true});
  return data;
}

async function CheckUserbyEmail(email){
  const user=await Users.find({Email:email});
   return user;
}

async function UpdatePasswordbyEmail(email,password){
  const user=await Users.find({Email:email});
  var data= await Users.findByIdAndUpdate(user[0]._id,{Password:password});
  return data;
}

module.exports={
  Register,
  Login,
  ForgetPassword,
  ForgetName,
  VerfiyUser,
  CheckUserbyEmail,
  UpdatePasswordbyEmail
}