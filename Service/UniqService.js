const uniqid = require("uniqid")

const GetUniqueId=(name)=>{
    var Id=uniqid();
    return Id;
}

module.exports  =   GetUniqueId;