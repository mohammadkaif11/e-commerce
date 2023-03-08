 const querys = {
    GetUSERBYID: "SELECT * FROM [ECM].[dbo].[USER] WHERE UserId= @userId",
    AddUser:"INSERT INTO [ECM].[dbo].[User] (Name, Email,IsVerify,Role,Password,UserId) VALUES (@name,@email,@isVerify,@role,@password,@userId);",
    CheckUserEmail: "SELECT * FROM [ECM].[dbo].[USER] WHERE Email= @email",
    Login: "SELECT * FROM [ECM].[dbo].[USER] WHERE Email= @email",
    VerfiyUser:"UPDATE [ECM].[dbo].[USER] SET IsVerify = 1 WHERE UserId = @userId",
    UPDATEPASSWORD:"UPDATE [ECM].[dbo].[USER] SET Password = @password WHERE UserId = @userId",
    CHANGEPASSWORD:"UPDATE [ECM].[dbo].[USER] SET Password = @password WHERE UserId = @userId",
    CHANGENAME:"UPDATE [ECM].[dbo].[USER] SET  Name = @name WHERE UserId = @userId"
  };

  module.exports=querys