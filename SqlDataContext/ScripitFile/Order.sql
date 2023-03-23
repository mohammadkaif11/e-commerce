create Table Orders(
  Id int primary key identity,
  UserId int,
  [Date] date,
  [Address] varchar(max),
  [Pincode] varchar(max),
  ModePayment varchar(max),
  CustomerCancel  bit,
  IsOrderSuccess bit
);

create Table OrderProducts(
    Id int primary key identity(1,1),
	OrderId int,
	OrderProducts varchar(max),
    AdminId int,
	TotalAmount decimal,
	TotalItemQuantity int,
	[Status] bit,
	DeliveryDate date,
    [Message] varchar(max),
    IsCancel Bit
);