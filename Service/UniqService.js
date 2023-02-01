const uniqid = require("uniqid")

const GetUniqueId=(name)=>{
    var Id=uniqid(name+'-');
    console.log(Id)
    return Id;
}

module.exports  =   GetUniqueId;