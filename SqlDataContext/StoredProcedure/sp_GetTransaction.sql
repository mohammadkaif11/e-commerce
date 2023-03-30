create PROCEDURE [dbo].[sp_GetTransaction] 
@AdminId int,
@CustomerCancel bit=null,
@SellerCancel bit=null,
@DeliveryDate date=null,
@Page INT,
@Size INT
AS
BEGIN
    
	if(@DeliveryDate is  null and @CustomerCancel is  null and @SellerCancel is not null)
    Begin 
	 select Trans.Id,Trans.AdminId,Trans.CustomerCancel,Trans.IsCancel,Trans.OrderId,Trans.TotalAmount,Trans.PaymentMode,Trans.Date,Trans.Message,
	 Orders.Date as OrderDate
	 from Trans
	 left Join Orders on Trans.OrderId=Orders.Id left join OrderProducts on OrderProducts.OrderId=Orders.Id and OrderProducts.AdminId=@AdminId where Trans.AdminId=@AdminId and Trans.IsCancel=@SellerCancel
	 ORDER BY Id
     OFFSET (@Page -1) * @Size ROWS
     FETCH NEXT @Size ROWS ONLY
	End

	if(@DeliveryDate is  null and @CustomerCancel is not null and @SellerCancel is null)
    Begin 
	 select Trans.Id,Trans.AdminId,Trans.CustomerCancel,Trans.IsCancel,Trans.OrderId,Trans.TotalAmount,Trans.PaymentMode,Trans.Date,Trans.Message,
	 Orders.Date as OrderDate
	 from Trans
	 left Join Orders on Trans.OrderId=Orders.Id left join OrderProducts on OrderProducts.OrderId=Orders.Id and OrderProducts.AdminId=@AdminId where Trans.AdminId=@AdminId and Trans.CustomerCancel=@CustomerCancel
	 ORDER BY Id
     OFFSET (@Page -1) * @Size ROWS
     FETCH NEXT @Size ROWS ONLY
	End

	if(@DeliveryDate is  not null and @CustomerCancel is  null and @SellerCancel is  null)
	Begin 
	 select Trans.Id,Trans.AdminId,Trans.CustomerCancel,Trans.IsCancel,Trans.OrderId,Trans.TotalAmount,Trans.PaymentMode,Trans.Date,Trans.Message,
	 Orders.Date as OrderDate
	 from Trans
	 left Join Orders on Trans.OrderId=Orders.Id left join OrderProducts on OrderProducts.OrderId=Orders.Id and OrderProducts.AdminId=@AdminId where Trans.AdminId=@AdminId and Orders.Date=@DeliveryDate
	 ORDER BY Id
     OFFSET (@Page -1) * @Size ROWS
     FETCH NEXT @Size ROWS ONLY
	End

	if(@DeliveryDate is  null and @CustomerCancel is not null and @SellerCancel is not null)
    Begin 
	 select Trans.Id,Trans.AdminId,Trans.CustomerCancel,Trans.IsCancel,Trans.OrderId,Trans.TotalAmount,Trans.PaymentMode,Trans.Date,Trans.Message,
	 Orders.Date as OrderDate
	 from Trans
	 left Join Orders on Trans.OrderId=Orders.Id left join OrderProducts on OrderProducts.OrderId=Orders.Id and OrderProducts.AdminId=@AdminId where Trans.AdminId=@AdminId and Trans.CustomerCancel=@CustomerCancel and Trans.IsCancel=@SellerCancel
	 ORDER BY Id
     OFFSET (@Page -1) * @Size ROWS
     FETCH NEXT @Size ROWS ONLY
	End

	if(@DeliveryDate is not null and @CustomerCancel is not null and @SellerCancel is  null)
    Begin 
	 select Trans.Id,Trans.AdminId,Trans.CustomerCancel,Trans.IsCancel,Trans.OrderId,Trans.TotalAmount,Trans.PaymentMode,Trans.Date,Trans.Message,
	 Orders.Date as OrderDate
	 from Trans
	 left Join Orders on Trans.OrderId=Orders.Id left join OrderProducts on OrderProducts.OrderId=Orders.Id and OrderProducts.AdminId=@AdminId where Trans.AdminId=@AdminId and Trans.CustomerCancel=@CustomerCancel  and 
	 Orders.Date=@DeliveryDate
	 ORDER BY Id
     OFFSET (@Page -1) * @Size ROWS
     FETCH NEXT @Size ROWS ONLY
	End

	if(@DeliveryDate is not null and @CustomerCancel is  null and @SellerCancel is not null)
    Begin 
	 select Trans.Id,Trans.AdminId,Trans.CustomerCancel,Trans.IsCancel,Trans.OrderId,Trans.TotalAmount,Trans.PaymentMode,Trans.Date,Trans.Message,
	 Orders.Date as OrderDate
	 from Trans
	 left Join Orders on Trans.OrderId=Orders.Id left join OrderProducts on OrderProducts.OrderId=Orders.Id and OrderProducts.AdminId=@AdminId where Trans.AdminId=@AdminId and Trans.IsCancel=@SellerCancel and 
	 Orders.Date=@DeliveryDate
	 ORDER BY Id
     OFFSET (@Page -1) * @Size ROWS
     FETCH NEXT @Size ROWS ONLY
	End

    if(@DeliveryDate is not null and @CustomerCancel is not null and @SellerCancel is not null)
     Begin 
	 select Trans.Id,Trans.AdminId,Trans.CustomerCancel,Trans.IsCancel,Trans.OrderId,Trans.TotalAmount,Trans.PaymentMode,Trans.Date,Trans.Message,
	 Orders.Date as OrderDate
	 from Trans
	 left Join Orders on Trans.OrderId=Orders.Id left join OrderProducts on OrderProducts.OrderId=Orders.Id and OrderProducts.AdminId=@AdminId where Trans.AdminId=@AdminId and Trans.CustomerCancel=@CustomerCancel and Trans.IsCancel=@SellerCancel and 
	 Orders.Date=@DeliveryDate
	 ORDER BY Id
     OFFSET (@Page -1) * @Size ROWS
     FETCH NEXT @Size ROWS ONLY
	End

	if(@DeliveryDate is null and @CustomerCancel is null and @SellerCancel is null)
	Begin
     select Trans.Id,Trans.AdminId,Trans.CustomerCancel,Trans.IsCancel,Trans.OrderId,Trans.TotalAmount,Trans.PaymentMode,Trans.Date,Trans.Message,
	 Orders.Date as OrderDate
	from Trans   
	 left Join Orders on Trans.OrderId=Orders.Id left join OrderProducts on OrderProducts.OrderId=Orders.Id and OrderProducts.AdminId=@AdminId  where Trans.AdminId=@AdminId 
	 ORDER BY Id
     OFFSET (@Page -1) * @Size ROWS
     FETCH NEXT @Size ROWS ONLY
	End
END
