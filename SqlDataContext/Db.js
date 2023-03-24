const sql  = require('mssql/msnodesqlv8');
var config = {
  driver: "msnodesqlv8",
  server: "MSI",
  database: "ECM",
  user: 'MSI\\moham',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  }
}
const ConenctedToSql=async()=>{
      try {
        const pool = await sql.connect(config);
        return pool;
      } catch (error) {
        console.error(error);
        console.log('Error to SQL Server')
      }
}

module.exports =ConenctedToSql;
