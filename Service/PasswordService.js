const bcrypt = require("bcrypt")

const HashPasswords= async (plaintextPassword)=>{
  const hash = await bcrypt.hash(plaintextPassword, 10);
  return hash;
}

const HashComparePassword=async (plaintextPassword, hash)=>{
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}


module.exports={HashComparePassword,HashPasswords}