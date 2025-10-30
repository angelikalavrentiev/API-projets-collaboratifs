// app.js
const express = require('express');
const path = require('path');
const app = express();
const projectsRouter = require('./routes/projects.routes');
const morgan = require('morgan');





app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));//x-www-form-urlencoded
app.use(express.json());
app.use(morgan('dev'));



app.use('/projects', projectsRouter);

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
