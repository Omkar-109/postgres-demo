import express from "express"
import bodyParser from "body-parser"

const app = express()
app.use(express.static("public")) 
app.use(bodyParser.urlencoded({extended:true}))

app.get('/', (request, response) => {
    //fetch database
    response.render("home.ejs")  

})

app.post('/addstudent', (request, response) => {
     data=request.body
     console.log(data)
     //add to database
})

app.listen(3000, () => {
    console.log(`Server is Listening on 3000`)
})