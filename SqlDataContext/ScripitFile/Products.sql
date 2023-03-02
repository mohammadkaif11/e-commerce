create Table Products(
    Id int primary key identity ,
	UserId int Not null,
    ProductName varchar(max),
    ProductPrice decimal,
    ProductDescription varchar(max),
	 ImageUrl varchar(max),
	 );