// const express = require('express');

// const app = express();

// app.get('/', (req, res) => res.send('Home Page Route'));

// app.get('/about', (req, res) => res.send('About Page Route'));

// app.get('/portfolio', (req, res) => res.send('Portfolio Page Route'));

// app.get('/contact', (req, res) => res.send('Contact Page Route'));

// const port = process.env.PORT || 3000;

// app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`));

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Student = require("./studentSchema");
const csvtojson = require("csvtojson");
const port = process.env.PORT || 3000;
const app = express();

mongoose
  .connect(
    "mongodb+srv://alexkwok:Abc123456789@cluster0.wcqrluq.mongodb.net/test"
  )
  .then(() => {
    // MongoDB connection
    console.log("database connected");
  });

app.use(express.static("public")); // static folder
app.set("view engine", "ejs"); // set the template engine

var excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/excelUploads"); // file added to the public folder of the root directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
var excelUploads = multer({ storage: excelStorage });
app.get("/", (req, res) => {
  res.render("index.ejs");
});
// upload excel file and import in mongodb
app.post("/uploadExcelFile", excelUploads.single("uploadfile"), (req, res) => {
  console.log(
    `"./public" + "/excelUploads/" + req.file.filename`,
    "./public" + "/excelUploads/" + req.file.filename
  );
  importFile("./public" + "/excelUploads/" + req.file.filename);

  function importFile(filePath) {
    //  Read Excel File to Json Data
    var arrayToInsert = [];
    csvtojson()
      .fromFile(filePath)
      .then((source) => {
        // Fetching the all data from each row
        for (var i = 0; i < source.length; i++) {
          console.log("Source", source[i]["name2"]);
          var singleRow = {
            name2: source[i]["name2"],
            email: source[i]["email"],
            standard: source[i]["standard"],
          };
          arrayToInsert.push(singleRow);
        }
        //inserting into the table student
        Student.insertMany(arrayToInsert, (err, result) => {
          if (err) console.log("err:", err);
          if (result) {
            console.log("File imported successfully.");
            res.redirect("/");
          }
        });
      });
  }
});

app.listen(port, () =>
  console.log(`Server running on ${port}, http://localhost:${port}`)
);
