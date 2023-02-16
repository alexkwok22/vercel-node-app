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
const path = require("path");
const fs = require("fs");

mongoose
  .connect(
    "mongodb+srv://alexkwok:Abc123456789@cluster0.wcqrluq.mongodb.net/test"
  )
  .then(() => {
    // MongoDB connection
    console.log("database connected");
  });

app.use(express.static("public")); // static folder
app.set("views", path.join(__dirname, "./views/"));
app.set("view engine", "ejs");
// let target = path.join(__dirname, "tmp");
let excelStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     // cb(null, "./public/excelUploads"); // file added to the public folder of the root directory
  //     cb(null, target); // file added to the public folder of the root directory
  //   },
  destination: "/tmp",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
let excelUploads = multer({ storage: excelStorage });
app.get("/", (req, res) => {
  //   const fullPath = process.cwd() + "/public"; //(not __dirname)
  //   const dir = fs.opendirSync(fullPath);
  //   let entity;
  //   let listing = [];
  //   while ((entity = dir.readSync()) !== null) {
  //     if (entity.isFile()) {
  //       listing.push({ type: "f", name: entity.name });
  //     } else if (entity.isDirectory()) {
  //       listing.push({ type: "d", name: entity.name });
  //     }
  //   }
  //   dir.closeSync();
  //   res.send(listing);

  res.render("index");
});
// upload excel file and import in mongodb
app.post("/uploadExcelFile", excelUploads.single("uploadfile"), (req, res) => {
  let myPath = path.join(
    // __dirname,
    "/tmp",
    req.file.filename
  );
  //   importFile("./public" + "/excelUploads/" + req.file.filename);
  importFile(myPath);

  function importFile(filePath) {
    //  Read Excel File to Json Data
    let arrayToInsert = [];
    csvtojson()
      .fromFile(filePath)
      .then((source) => {
        // Fetching the all data from each row
        for (let i = 0; i < source.length; i++) {
          console.log("Source", source[i]["name2"]);
          let singleRow = {
            name2: source[i]["name2"],
            email: source[i]["email"],
            standard: source[i]["standard"],
          };
          arrayToInsert.push(singleRow);
        }
        //inserting into the table student
        Student.insertMany(arrayToInsert, (err, result) => {
          if (err) {
            console.log("err:", err);

            return res.status(400).send("upload failed", err);
          }

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
