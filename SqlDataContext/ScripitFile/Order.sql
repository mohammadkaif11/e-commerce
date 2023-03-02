create Table Orders(
  Id int primary key identity,
  UserId int,
  [Date] date,
  [Address] varchar(max),
  [Pincode] varchar(max)
);

create Table OrderProducts(
    Id int primary key identity,
	OrderId int,
	ProductId int,
    AdminId int,
	Quantity int,
);