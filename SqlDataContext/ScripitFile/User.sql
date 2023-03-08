create Table [User](
  Id int primary key identity ,
  UserId varchar(max),
  [Name] varchar(50),
  Email varchar(50),
  IsVerify bit,
  [Role] varchar(10),
  [Password] varchar(max)
);

