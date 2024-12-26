import express from "express"
import bodyParser from "body-parser"
import pg from "pg";
import env from "dotenv"

env.config();

//database connection object
const db = new pg.Client({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

const app = express()
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

db.connect();

app.get('/', async (request, response) => {
    //fetch database
    try {
        const result = await db.query('SELECT * FROM studentinfo');
        //console.log(result.rows)
        response.render("home.ejs",{students : result.rows})  
      } catch (err) {
        console.error(err.message);
      }  
      
})

app.get('/insert', (request, response) => {
  //go to add new student page
   response.render("insert.ejs",{ error: null })
})

app.post('/addstudent', async (request, response) => {
    console.log(request.body)
    const { rollno, name } = request.body
    try{

        //checking if rollno already exists
        const checkResult = await db.query('SELECT * FROM studentinfo WHERE rollno = $1', [rollno]);
        if (checkResult.rows.length > 0) {
            // Roll number already exists
            return response.render('insert.ejs', { error: "Roll number already exists!" });
        }

        const result=await db.query('INSERT INTO studentinfo (rollno, s_name) VALUES ($1, $2) RETURNING *',
            [rollno, name]);
        console.log(result)
        response.redirect("/")
    
    } catch(err){
        console.error(err)
    } 
     
})

app.get('/delete', (request, response) => {
     response.render("delete.ejs")
})

app.post('/remove', async (request, response) => {
     console.log(request.body)
     const { searchPara, name, rollno } = request.body
     console.log(searchPara)
     try{
            if(searchPara === "rollno"){
                
            }
            if(searchPara === "name"){
               
            }
     }catch(error){

     }
     
     response.redirect("/")
})

// Gracefully close the database connection on app termination
// When we terminate the express server using Ctrl+C db connection is closed
process.on('SIGINT', async () => {
    console.log("Closing database connection...");
    await db.end();
    process.exit(0);
});
app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})