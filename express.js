import express from "express"
import bodyParser from "body-parser"
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "",
  password: "",
  port: 5432,
});

const app = express()
app.use(express.static("public")) 
app.use(bodyParser.urlencoded({extended:true}))

db.connect();

app.get('/', async (request, response) => {
    //fetch database

    try {
        const result = await db.query('SELECT * FROM studenttable');
        response.status(200).json(result.rows);
      } catch (err) {
        console.error(err.message);
        response.status(500).send('Server Error');
      }

    response.render("home.ejs")  

})

app.post('/addstudent', async (request, response) => {
    
    const { rollno, name } = request.body
    try{
        const result=await db.query('INSERT INTO studenttable (rollno, s_name) VALUES ($1, $2) RETURNING *',
            [rollno, name]);
        console.log(result)
    
    } catch(err){
        console.error(err)
    }
     
     //add to database
})

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})