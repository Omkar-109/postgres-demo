import { Router } from "express";
import env from "dotenv";
import db from "../db.js";

env.config();

const router = Router();

router.get('/insert', (request, response) => {
    //go to add new student page
    response.render("insert.ejs", { error: null })
})

router.post('/addstudent', async (request, response) => {
    console.log(request.body)
    const { rollno, name, graduation_percentage } = request.body
    try {

        //checking if rollno already exists
        const checkResult = await db.query(
            `SELECT * FROM ${process.env.TABLE_NAME} 
              WHERE ${process.env.ROLLNO_COLUMN} = $1`, [rollno]);
        if (checkResult.rows.length > 0) {
            // Roll number already exists
            return response.render('insert.ejs', { error: "Roll number already exists!" });
        }

        const result = await db.query(
            `INSERT INTO ${process.env.TABLE_NAME} (${process.env.ROLLNO_COLUMN}, ${process.env.NAME_COLUMN}, ${process.env.PERCENTAGE_COLUMN}) 
              VALUES ($1, $2, $3) 
              RETURNING *`,
            [rollno, name, graduation_percentage]);
        console.log(result)
        response.redirect("/")

    } catch (err) {
        console.error(err)
    }

})

router.get('/delete', (request, response) => {
    response.render("delete.ejs", { error: null })
})

router.post('/remove', async (request, response) => {
    console.log(request.body)
    const { searchPara, name, rollno } = request.body
    console.log(searchPara)
    try {
        //if radio is rollno
        if (searchPara === "rollno") {
            //checking if rollno exists
            const checkResult = await db.query(
                `SELECT * FROM ${process.env.TABLE_NAME} 
                  WHERE ${process.env.ROLLNO_COLUMN} = $1`, [rollno]);
            if (checkResult.rows.length > 0) {
                // Roll number exists
                const result = await db.query(`DELETE FROM ${process.env.TABLE_NAME} 
                      WHERE ${process.env.ROLLNO_COLUMN} = $1`, [rollno])
                console.log(result.rowCount)
                response.redirect("/")
            }
            else {
                return response.render('delete.ejs', { error: "Roll number does not exists!" });
            }
        }
        //if radio is name
        if (searchPara === "name") {
            //checking if name exists
            const checkResult = await db.query(
                `SELECT * FROM ${process.env.TABLE_NAME} 
                  WHERE ${process.env.NAME_COLUMN} = $1`, [name]);
            if (checkResult.rows.length > 0) {
                // name exists
                const result = await db.query(`DELETE FROM ${process.env.TABLE_NAME} 
                      WHERE ${process.env.NAME_COLUMN} = $1`, [name])
                console.log(result.rowCount)
                response.redirect("/")
            }
            else {
                return response.render('delete.ejs', { error: "Name does not exists!" });
            }
        }

    } catch (err) {
        console.error(err)
    }
})

router.get('/update', (request, response) => {
    response.render("update.ejs", { error: null })
})

router.post('/editstudent', async (request, response) => {
    console.log(request.body)
    const { rollno, newname, new_graduation_percentage } = request.body
    console.log(newname)
    try {
        //checking if rollno exists
        const checkResult = await db.query(
            `SELECT * FROM ${process.env.TABLE_NAME} 
              WHERE ${process.env.ROLLNO_COLUMN} = $1`, [rollno]);
        if (checkResult.rows.length > 0) {
            // Roll number exists
            const result = await db.query(`UPDATE ${process.env.TABLE_NAME} 
                  SET ${process.env.NAME_COLUMN} = $1,
                   ${process.env.PERCENTAGE_COLUMN} = $3
                  WHERE ${process.env.ROLLNO_COLUMN} = $2`, [newname, rollno, new_graduation_percentage])
            console.log(result.rowCount)
            response.redirect("/")
        }
        else {
            return response.render('update.ejs', { error: "Roll number does not exists!" });
        }

    } catch (err) {
        console.error(err)
    }

})

export default router;