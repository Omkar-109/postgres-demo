import express from "express"
import bodyParser from "body-parser"
import env from "dotenv";
import db from "./db.js";
import studentRoutes from "./routes/student.js";
import courseRoutes from "./routes/course.js"

env.config();


const app = express()
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))
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
    try {
      const studentData = await db.query('SELECT rollno, s_name FROM student');
      const courseData = await db.query('SELECT course_id, course_name FROM course');
      const enrollmentData = await db.query(`
        SELECT s.s_name, c.course_name
        FROM student s
        JOIN enrollment e ON s.rollno = e.rollno
        JOIN course c ON e.course_id = c.course_id
      `);
  
      res.render('student-courses.ejs', {
        data: enrollmentData.rows,
        students: studentData.rows,
        courses: courseData.rows,
        error: null
      });
    } catch (err) {
      console.error(err);
      res.render('student-courses.ejs', {
        data: [],
        students: [],
        courses: [],
        error: 'Something went wrong!!'
      });
    }
  });
  

app.post('/addenrollment', async (req, res) => {
    const { rollno, course_id } = req.body;
  
    try {
      await db.query('BEGIN');
  
      // Optional: Check if already enrolled
      const check = await db.query(
        'SELECT * FROM enrollment WHERE rollno = $1 AND course_id = $2',
        [rollno, course_id]
      );
  
      if (check.rows.length > 0) {
        await db.query('ROLLBACK');
        const studentData = await db.query('SELECT rollno, s_name FROM student');
      const courseData = await db.query('SELECT course_id, course_name FROM course');
      const enrollmentData = await db.query(`
        SELECT s.s_name, c.course_name
        FROM student s
        JOIN enrollment e ON s.rollno = e.rollno
        JOIN course c ON e.course_id = c.course_id
      `);
        return res.render('student-courses.ejs', {
          error: 'Student already enrolled in this course.',
          data: enrollmentData.rows,
        students: studentData.rows,
        courses: courseData.rows,
        });
      }
  
      // Enroll the student
      await db.query(
        'INSERT INTO enrollment (rollno, course_id) VALUES ($1, $2)',
        [rollno, course_id]
      );
  
      await db.query('COMMIT');
      res.redirect('/student-courses');
    } catch (err) {
      await db.query('ROLLBACK');
      console.error(err);
      const studentData = await db.query('SELECT rollno, s_name FROM student');
      const courseData = await db.query('SELECT course_id, course_name FROM course');
      const enrollmentData = await db.query(`
        SELECT s.s_name, c.course_name
        FROM student s
        JOIN enrollment e ON s.rollno = e.rollno
        JOIN course c ON e.course_id = c.course_id
      `);
      res.render('student-courses.ejs', {
        error: 'Failed to enroll student!',
        data: enrollmentData.rows,
        students: studentData.rows,
        courses: courseData.rows,
      });
    }
  });
  

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})