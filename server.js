const app = require('./app');
const {connect}= require("mongoose");
require('dotenv').config();

const port = process.env.PORT ?? 3000;

app.listen(
  port,
  () => {
    console.log(`Server started on port ${port}.`);

    connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }, () => {
      console.log('Connection to databse is successful %s', process.env.DB_URL);
    });
  }
);
