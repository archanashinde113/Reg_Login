
const User = require("../models/RegLogin");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer')


var email;

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user:"user" ,
        pass: "pass",
    }

});
module.exports = {
    send : function (req, res) {
        const { Firstname, Lastname,email,  Password, confirm } = req.body;
  if (!Firstname || !Lastname || !email || !Password || !confirm) {
    res.send("Fill empty fields");
  }
  //Confirm Passwords
  if (Password !== confirm) {
    console.log("Password must match");
  } else {
    //Validation
    User.findOne({ email: email }).then((user) => {
      if (user) {
        console.log("email exists");
        res.send({
          Firstname,
          Lastname,
          email,
          Password,
          confirm,
        });
      } else {
        //Validation
        const newUser = new User({
          Firstname,
          Lastname,
          email,
          Password,
          otp
        });
      
        
        //Password Hashing
       
   
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.Password, salt, (err, hash) => {
            if (err) throw err;
            newUser.Password = hash;
            newUser.save()
              // .then(res.redirect("/login"))
              // .catch((err) => console.log(err));
          })
        );
      }
    });
  }
        

        // send mail with defined transport object
        var mailOptions = {
            to: req.body.email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
             res.send({
               Firstname,
               Lastname,
               email,
               Password,
               otp
             });
           
        });

      
    },
    login:  (async( req,res) =>{
      const body = req.body;
    const user = await User.findOne({ email: body.email });
    if (user) {
      // check user password with hashed password stored in the database
      const validPassword = await bcrypt.compare(body.Password, user.Password);
      if (validPassword) {
        res.status(200).json({ message: "Login Successfully" });
      } else {
        res.status(400).json({ error: "Invalid Password" });
      }
    } else {
      res.status(401).json({ error: "User does not exist" });
    }
    }),

    update: function (req,res){
      if (!req.body) {
        return res.status(400).send({
          message: "Data to update can not be empty!"
        });
      }
      const id = req.params.id;
      User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
          if (!data) {
            res.status(404).send({
              message: `Cannot update user with id=${id}. Maybe user was not found!`
            });
          } else res.send({ message: "user was updated successfully." });
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating user with id=" + id
          });
        });
    },
    findOne: function(req,res){
      const id = req.params.id;
      User.findById(id)
        .then(data => {
          if (!data)
            res.status(404).send({ message: "Not found user with id " + id });
          else res.send(data);
        })
        .catch(err => {
          res
            .status(500)
            .send({ message: "Error retrieving user with id=" + id });
        });
    },
    findAll : function (req,res){
      const Firstname = req.query. Firstname;
      var condition =  Firstname ? {  Firstname: { $regex: new RegExp( Firstname), $options: "i" } } : {};
      User.find(condition)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving user Detail."
          });
        });
    },
    delete: function(req,res) {
      const id = req.params.id;
      User.findByIdAndRemove(id)
        .then(data => {
          if (!data) {
            res.status(404).send({
              message: `Cannot delete user with id=${id}. Maybe user was not found!`
            });
          } else {
            res.send({
              message: "user was deleted successfully!"
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Could not delete user with id=" + id
          });
        });
    },

    deleteall:function (req,res){
      User.deleteMany({})
      .then(data => {
        res.send({
          message: `${data.deletedCount} users were deleted successfully!`
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all users."
        });
      });
    },
    verify: function (req, res) {
      
        if (req.body.otp == otp) {
            res.send("You has been successfully registered");
            
        }
        else {
            res.render('otp', { msg: 'otp is incorrect' });
        }

      
    },

    resend: function(req,res){
        email = req.body.email;
        var mailOptions = {
            to: email,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            // res.send('otp', { msg: "otp has been sent" });
            res.send('otp has been sent')
        });
    
    }


    
}