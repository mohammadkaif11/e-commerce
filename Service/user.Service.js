const Users = require("../DataContext/DataBaseModel/Usermodel");
const PasswordServices=require('../Service/PasswordService');
const GetUniqueId=require('../Service/UniqService');


async function Register(data) {
  const {HashPasswords}=PasswordServices;
  var checkUser = await Users.findOne({ Email: data.Email });
  if (checkUser != null) {
    return null;
  }
  const HashPassword=await HashPasswords(data.Password);
  const UserId=GetUniqueId(data.Name);
  console.log(UserId);
  var user = new Users({
    Name: data.Name,
    Email: data.Email,
    Password: HashPassword,
    Role:"user",
    IsVerify:false,
    userId:UserId
  });

  var data = await user.save();
  return data;
}

async function Login(data) {
  const {HashComparePassword}=PasswordServices;

  var user = await Users.findOne({
    Email: data.Email,
  });

  var VerifyHashUser=await HashComparePassword(data.Password,user.Password);
  if(VerfiyUser==false){
    return null;
  }
  return user;
}

async function ForgetPassword(data,userId){
    const {HashPasswords}=PasswordServices;
    const HashPassword=await HashPasswords(data.Password);
    var data= await Users.findByIdAndUpdate(userId,{Password:HashPassword});
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
  const {HashPasswords}=PasswordServices;
  const HashPassword=await HashPasswords(password);
  
  const user=await Users.find({Email:email});
  var data= await Users.findByIdAndUpdate(user[0]._id,{Password:HashPassword});
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