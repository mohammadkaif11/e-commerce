const ConenctedToSql = require("../SqlDataContext/Db");
const sql = require("mssql/msnodesqlv8");
const querys = require("../SqlDataContext/Querys/Userquers");
const PasswordServices = require("../Service/PasswordService");
const GetUniqueId = require("../Service/UniqService");

//Register User
async function Register(data) {
  const pool = await ConenctedToSql();
  const { HashPasswords } = PasswordServices;
  const HashPassword = await HashPasswords(data.Password);
  const UserId = GetUniqueId(data.Name);
  const CheckUserExist = await pool
    .request()
    .input("email", sql.VarChar, data.Email)
    .query(querys.CheckUserEmail);
  if (CheckUserExist.recordset.length != 0) {
    return null;
  }
  const response = await pool
    .request()
    .input("name", sql.VarChar, data.Name)
    .input("password", sql.VarChar, HashPassword)
    .input("email", sql.VarChar, data.Email)
    .input("role", sql.VarChar, "user")
    .input("userId", UserId)
    .input("isVerify", sql.Bit, 0)
    .query(querys.AddUser);
  if (response.rowsAffected[0]) {
    const responseObj = {
      userId: UserId,
      Email: data.Email,
    };
    return responseObj;
  }
  return null;
}

//Login User
async function Login(data) {
  const pool = await ConenctedToSql();
  const { HashComparePassword } = PasswordServices;
  const user = await pool
    .request()
    .input("email", sql.VarChar, data.Email)
    .query(querys.Login);
  if (user.recordset.length == 0) {
    return null;
  }
  var VerfiyUser = await HashComparePassword(
    data.Password,
    user.recordset[0].Password
  );
  if (VerfiyUser == false) {
    return null;
  }
  return user.recordset[0];
}

//Change Password
async function ForgetPassword(data, userId) {
  const { HashPasswords } = PasswordServices;
  const pool = await ConenctedToSql();
  const HashPassword = await HashPasswords(data.Password);
  const user = await pool
    .request()
    .input("password", sql.VarChar, HashPassword)
    .input("userId", sql.VarChar, userId)
    .query(querys.CHANGEPASSWORD);

  return user.rowsAffected[0];
}

//ChangeName
async function ForgetName(data, userId) {
  const pool = await ConenctedToSql();
  const user = await pool
    .request()
    .input("userId", sql.VarChar, userId)
    .input("name", sql.VarChar, data.Name)
    .query(querys.CHANGENAME);
  return user.rowsAffected[0];
}

//VerfiyUser
async function VerfiyUser(UserId) {
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("userId", sql.VarChar, UserId)
    .query(querys.VerfiyUser);
  return response.rowsAffected[0];
}

//Check Email Verification for forget Password
async function CheckUserbyEmail(email) {
  const pool = await ConenctedToSql();
  const user = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query(querys.Login);
  if (user.recordset.length == 0) {
    return null;
  }
  return user.recordset[0];
}

//forget password by email
async function UpdatePasswordbyEmail(userId, password) {
  const { HashPasswords } = PasswordServices;
  const HashPassword = await HashPasswords(password);
  const pool = await ConenctedToSql();
  const response = await pool
    .request()
    .input("userId", sql.VarChar, userId)
    .input("password", HashPassword)
    .query(querys.UPDATEPASSWORD);
  return response.rowsAffected[0];
}

//get user by userId
async function GetUserByuserId(userId) {
  const pool = await ConenctedToSql();
  const user = await pool
    .request()
    .input("userId", sql.VarChar, userId)
    .query(querys.GetUSERBYID);
  if (user.recordset.length == 0) {
    return null;
  }
  return user.recordset[0];
}


//Regsiter Admin
async function RegisterAdmin(data) {
  pool = await ConenctedToSql();
  const { HashPasswords } = PasswordServices;
  const HashPassword = await HashPasswords(data.Password);
  const UserId = GetUniqueId(data.Name);
  const CheckUserExist = await pool
    .request()
    .input("email", sql.VarChar, data.Email)
    .query(querys.CheckUserEmail);
  if (CheckUserExist.recordset.length != 0) {
    return null;
  }
  const response = await pool
    .request()
    .input("name", sql.VarChar, data.Name)
    .input("password", sql.VarChar, HashPassword)
    .input("email", sql.VarChar, data.Email)
    .input("role", sql.VarChar, "admin")
    .input("userId", UserId)
    .input("isVerify", sql.Bit, 0)
    .query(querys.AddUser);
  if (response.rowsAffected[0]) {
    const responseObj = {
      userId: UserId,
      Email: data.Email,
    };
    return responseObj;
  }
  return null;
}

module.exports = {
  Register,
  Login,
  ForgetPassword,
  ForgetName,
  VerfiyUser,
  CheckUserbyEmail,
  UpdatePasswordbyEmail,
  GetUserByuserId,
  RegisterAdmin,
};
