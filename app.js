const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGODB_URI =
  "mongodb+srv://hungvq:Pass1@cluster0.mzvgb.mongodb.net/Charity?retryWrites=true&w=majority";

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err)
  });