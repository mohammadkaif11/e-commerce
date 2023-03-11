create Table Orders(
  Id int primary key identity,
  UserId int,
  [Date] date,
  [Address] varchar(max),
  [Pincode] varchar(max),
   ModePayment varchar(max)
);


create Table OrderProducts(
    Id int primary key identity(1,1),
	OrderId int,
	ProductId int,
    AdminId int,
	Quantity int,
	[Status] bit,
	DeliveryDate date
);

create table Trans(
Id  int primary key identity(1,1),
AdminId int,
OrderId int,
TotalAmount decimal,
PaymentMode varchar(max)
)
