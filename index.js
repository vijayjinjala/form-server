const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
var bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uplods", express.static("uplods"));

// **__ using multer __**
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uplods");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

var uplods = multer({
  storage: storage,
});

mongoose
  .connect("mongodb://127.0.0.1:27017/images")
  .then(() => {
    console.log("connection success");
  })
  .catch((err) => {
    console.log(err);
  });

const formschema = mongoose.Schema({
  fname: String,
  lname: String,
  state: String,
  city: String,
  email: String,
  pass: String,
  gender: String,
  course: String,
  img: String,
});

const test = mongoose.model("test", formschema);
var message = "Invalid request";
var status = 0;

// app.post('/registration',uplods.single('Image'),async(req,res)=> {
//   if (req.body.id) {
//     let result = await test.updateOne(
//       {
//         _id: req.body.id,
//       },
//       {
//         $set:{
//           fname: req.body.fname,
//           lname: req.body.lname,
//           state: req.body.state,
//           city: req.body.city,
//           email: req.body.email,
//           pass: req.body.pass,
//           gender:req.body.gender,
//           course:req.body.course
//         },
//       }
//     );
//     if(await result.acknowledged==true){
//       res.json({
//         message:"data update successfully..",
//         status:1
//       })
//     }else{
//       res.json({
//         message:message,
//         status:status
//       })
//     }
//   } else{
//     const user_table = new test({
//       fname: req.body.fname,
//       lname: req.body.lname,
//       state: req.body.state,
//       city: req.body.city,
//       email: req.body.email,
//       pass: req.body.pass,
//       gender:req.body.gender,
//       course:req.body.course,
//       img:req.file.filename,
//     });

//     user_table
//   .save()
//   .then(() => {
//     message = "Data Save..";
//     status = 1;
//     res.json({
//       message: message,
//       status: status,
//     });
//   })
//   .catch((err) => {
//     console.log(err._message);
//     message = err._message;
//     res.json({
//       message: message,
//       status: status,
//     });
//   });
// }
// }
// );

app.post("/registration", uplods.single("Image"), async (req, res) => {
  if (req.body.id) { //for update
    let filter = {
      _id: req.body.id,
    };
    let deleteimg = await test.find(filter).exec();
    console.log(deleteimg[0].img);
    if (req.file) {
      fs.unlink(`./uplods/${deleteimg[0].img}`, function (err) {
        if (err) {
          console.log("error occured", err);
          return;
        }
      });

      let result = await test.updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            fname: req.body.fname,
            lname: req.body.lname,
            state: req.body.state,
            city: req.body.city,
            email: req.body.email,
            pass: req.body.pass,
            gender: req.body.gender,
            course: req.body.course,
            img: req.file.filename,
          },
        }
      );

      if ((await result.acknowledged) == true) {
        res.json({
          message: "Data Updated Success",
          status: 1,
        });
      } else {
        res.json({
          message: message,
          status: status,
        });
      }
    } else {
      let result = await test.updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            fname: req.body.fname,
            lname: req.body.lname,
            state: req.body.state,
            city: req.body.city,
            email: req.body.email,
            pass: req.body.pass,
            gender: req.body.gender,
            course: req.body.course,
          },
        }
      );

      if ((await result.acknowledged) == true) {
        res.json({
          message: "Data Updated Success",
          status: 1,
        });
      } else {
        res.json({
          message: message,
          status: status,
        });
      }
    }
  } else { //for insert data
    const users_table = new test({
      fname: req.body.fname,
      lname: req.body.lname,
      state: req.body.state,
      city: req.body.city,
      email: req.body.email,
      pass: req.body.pass,
      gender: req.body.gender,
      course: req.body.course,
      img: req.file.filename,
    });
    users_table
      .save()
      .then(() => {
        message = "Data Saved";
        status = 1;
        res.json({
          message: message,
          status: status,
        });
      })
      .catch((err) => {
        console.log(err._message);
        message = err._message;
        res.json({
          message: message,
          status: status,
        });
      });
  }
});

app.get("/registration", async (req, res) => {
  let filter = {};
  if (req.query.id != null) {
    filter = {
      _id: req.query.id,
    };
  }
  try {
    let Data = await test.find(filter).exec();
    // console.log(Data);
    res.json(Data);
  } catch (error) {
    console.log(`database fetch error ${error}`);
  }
});

app.put("/registration", async (req, res) => {
  let filter = {};
  if (req.query.id != null) {
    filter = {
      _id: req.query.id,
    };
    try {
      let uploadsimg = await test.find(filter).exec();
      console.log(uploadsimg[0]);
      fs.unlink(`./uplods/${uploadsimg[0].img}`, function (err) {
        if (err) {
          console.log("error occured", err);
          return;
        }
      });

      let Data = await test.deleteOne(filter).exec();
      if (Data.deletedCount > 0) {
        (message = "Data delete successfully.. "), (status = 1);
      } else {
        message = "Data delete not successfully.. ";
      }
      res.json({
        message: message,
        status: status,
      });
    } catch (error) {
      console.log(`database fetch error ${error}`);
    }
  } else {
    res.json({
      message: "id is required",
      status: 0,
    });
  }
});

app.listen(3002, () => {
  console.log("Server Started");
});
