import express from "express"
import bodyParser from "body-parser"
import env from "dotenv";
import db from "./db.js";
import studentRoutes from "./routes/student.js";
import courseRoutes from "./routes/course.js"

env.config();


const app = express()
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use("/students", studentRoutes);
app.use("/courses", courseRoutes);



app.get('/', async (req, res) => {
    try {
        const studentResult = await db.query(`SELECT * FROM ${process.env.TABLE_NAME}`);
        const courseResult = await db.query(`SELECT * FROM ${process.env.COURSE_TABLE}`);
        res.render("home.ejs", {
            students: studentResult.rows,
            courses: courseResult.rows
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading home page.");
    }
});

app.get('/student-courses', async (req, res) => {
  const result = await db.query(`
    SELECT s.s_name, c.course_name
    FROM student s
    JOIN enrollment e ON s.rollno = e.rollno
    JOIN course c ON e.course_id = c.course_id
  `);
  res.render('student-course.ejs', { data: result.rows });
});

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})