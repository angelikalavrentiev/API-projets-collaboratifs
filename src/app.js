require("dotenv").config();
const express = require('express');
const app = express();

const path = require('path');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

const projetRouter = require('./routes/projects.routes');
const memberRouter = require('./routes/members.routes');
const authRouter = require('./routes/auth.routes');


app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use(cookieParser("my_secret"));


app.use("/projects", projetRouter);
app.use("/projects/:projectId/members", memberRouter);
app.use("/", authRouter);


app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
