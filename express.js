import express from "express"
import bodyParser from "body-parser"
import env from "dotenv";
import db from "./db.js";
import studentRoutes from "./routes/student.js";

env.config();


const app = express()
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use("/students", studentRoutes);


app.get('/', async (request, response) => {
    //fetch database
    try {
        const result = await db.query(`SELECT * FROM ${process.env.TABLE_NAME} ORDER by ${process.env.ROLLNO_COLUMN}`);
        //console.log(result.rows)
        response.render("home.ejs",{students : result.rows})  
      } catch (err) {
        console.error(err.message);
      }  
      
})



app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})