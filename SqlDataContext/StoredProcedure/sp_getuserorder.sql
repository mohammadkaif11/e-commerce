create PROCEDURE [dbo].[sp_getuserorder] 
      @UserId INT,
	  @Page INT,
      @Size INT
AS
BEGIN
	SELECT *
   FROM (SELECT * 
      FROM Orders WHERE UserId=@UserId
      ORDER BY Id desc
      OFFSET (@Page -1) * @Size ROWS FETCH NEXT @Size ROWS ONLY ) AS t1
       JOIN OrderProducts AS t2 ON t1.Id = t2.OrderId
	  Order By  t1.Id desc
END
