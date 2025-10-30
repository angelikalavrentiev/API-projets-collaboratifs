// app.js
require("dotenv").config();
const express = require('express');
const app = express();

const path = require('path');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

// const memberRouter = require('./routes/members.routes');
//const projetRouter = require('./routes/projets.routes');
const authRouter = require('./routes/auth.routes');


app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use(cookieParser("my_secret"));


// app.use("/projet", projetRouter)
app.use("/", authRouter)
// app.use("/member", memberRouter)

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
