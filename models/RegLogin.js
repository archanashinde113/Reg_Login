const mongoose = require('mongoose');

const RegLoginSchema = new mongoose.Schema({
    Firstname: {
        type:String,
        
    },

    Lastname: {
        type:String,
        
    },

    email: {
        type:String
    },
    Password: {
        type : String
    },
   
    otp: {
        type : String
    },

    token:{
        type:String
    }
},
{timestamps:true}
) 

module.exports = mongoose.model('reglogin', RegLoginSchema)

