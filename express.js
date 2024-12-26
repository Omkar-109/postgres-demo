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
        const result = await db.query(`SELECT * FROM ${process.env.TABLE_NAME} ORDER by ${process.env.ROLLNO_COLUMN}`);
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
        const checkResult = await db.query(
            `SELECT * FROM ${process.env.TABLE_NAME} 
            WHERE ${process.env.ROLLNO_COLUMN} = $1`, [rollno]);
        if (checkResult.rows.length > 0) {
            // Roll number already exists
            return response.render('insert.ejs', { error: "Roll number already exists!" });
        }

        const result=await db.query(
            `INSERT INTO ${process.env.TABLE_NAME} (${process.env.ROLLNO_COLUMN}, ${process.env.NAME_COLUMN}) 
            VALUES ($1, $2) 
            RETURNING *`,
            [rollno, name]);
        console.log(result)
        response.redirect("/")
    
    } catch(err){
        console.error(err)
    } 
     
})

app.get('/delete', (request, response) => {
     response.render("delete.ejs",{error:null})
})

app.post('/remove', async (request, response) => {
     console.log(request.body)
     const { searchPara, name, rollno } = request.body
     console.log(searchPara)
     try{
        //if radio is rollno
        if(searchPara === "rollno"){
            //checking if rollno exists
            const checkResult = await db.query(
                `SELECT * FROM ${process.env.TABLE_NAME} 
                WHERE ${process.env.ROLLNO_COLUMN} = $1`, [rollno]);
            if (checkResult.rows.length > 0) {
                // Roll number exists
                const result=await db.query(`DELETE FROM ${process.env.TABLE_NAME} 
                    WHERE ${process.env.ROLLNO_COLUMN} = $1`,[rollno])
                console.log(result.rowCount)
                response.redirect("/")
            }
            else{
                return response.render('delete.ejs', { error: "Roll number does not exists!" });
            }
        }
        //if radio is name
        if(searchPara === "name"){
            //checking if name exists
            const checkResult = await db.query(
                `SELECT * FROM ${process.env.TABLE_NAME} 
                WHERE ${process.env.NAME_COLUMN} = $1`, [name]);
            if (checkResult.rows.length > 0) {
                // name exists
                const result=await db.query(`DELETE FROM ${process.env.TABLE_NAME} 
                    WHERE ${process.env.NAME_COLUMN} = $1`,[name])
                console.log(result.rowCount)
                response.redirect("/")
            }
            else{
                return response.render('delete.ejs', { error: "Name does not exists!" });
            }
        }
        
     }catch(err){
        console.error(err)
     }  
})

app.get('/update', (request, response) => {
     response.render("update.ejs",{error:null})
})

app.post('/editstudent', async (request, response) => {
     console.log(request.body)
     const {rollno,newname} = request.body
     console.log(newname)
     try{
        //checking if rollno exists
        const checkResult = await db.query(
            `SELECT * FROM ${process.env.TABLE_NAME} 
            WHERE ${process.env.ROLLNO_COLUMN} = $1`, [rollno]);
        if (checkResult.rows.length > 0) {
            // Roll number exists
            const result=await db.query(`UPDATE ${process.env.TABLE_NAME} 
                SET ${process.env.NAME_COLUMN} = $1 
                WHERE ${process.env.ROLLNO_COLUMN} = $2`,[newname,rollno])
            console.log(result.rowCount)
            response.redirect("/")
        }
        else{
            return response.render('update.ejs', { error: "Roll number does not exists!" });
        }
       
     }catch(err){
        console.error(err)
     }
     
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