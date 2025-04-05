import { Router } from "express";
import env from "dotenv";
import db from "../db.js";

env.config();

const router = Router();

router.get('/insert-course', (req, res) => {
    res.render("insert-course.ejs", { error: null });
});

router.post('/addcourse', async (req, res) => {
    const { course_id, course_name, credits } = req.body;

    try {
        const checkResult = await db.query(
            `SELECT * FROM ${process.env.COURSE_TABLE} WHERE ${process.env.COURSE_NAME_COLUMN} = $1`, 
            [course_name]
        );

        if (checkResult.rows.length > 0) {
            return res.render("insert-course.ejs", { error: "Course already exists!" });
        }

        await db.query(
            `INSERT INTO ${process.env.COURSE_TABLE} (${process.env.COURSE_ID_COLUMN}, ${process.env.COURSE_NAME_COLUMN}, ${process.env.COURSE_CREDITS_COLUMN}) VALUES ($1,$2,$3)`, 
            [course_id, course_name, credits]
        );

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("insert-course.ejs", { error: "Something went wrong!" });
    }
});

router.get('/delete-course', (req, res) => {
    res.render("delete-course.ejs", { error: null });
});

router.post('/removecourse', async (req, res) => {
    const { searchPara, course_id, course_name } = req.body;

    try {
        if (searchPara === "course_id") {
            const checkResult = await db.query(
                `SELECT * FROM ${process.env.COURSE_TABLE} 
                 WHERE ${process.env.COURSE_ID_COLUMN} = $1`, 
                [course_id]);

            if (checkResult.rows.length > 0) {
                const result = await db.query(
                    `DELETE FROM ${process.env.COURSE_TABLE} 
                     WHERE ${process.env.COURSE_ID_COLUMN} = $1`, 
                    [course_id]);
                console.log(result.rowCount);
                return res.redirect("/");
            } else {
                return res.render("delete-course.ejs", { error: "Course ID does not exist!" });
            }
        }

        if (searchPara === "course_name") {
            const checkResult = await db.query(
                `SELECT * FROM ${process.env.COURSE_TABLE} 
                 WHERE ${process.env.COURSE_NAME_COLUMN} = $1`, 
                [course_name]);

            if (checkResult.rows.length > 0) {
                const result = await db.query(
                    `DELETE FROM ${process.env.COURSE_TABLE} 
                     WHERE ${process.env.COURSE_NAME_COLUMN} = $1`, 
                    [course_name]);
                console.log(result.rowCount);
                return res.redirect("/");
            } else {
                return res.render("delete-course.ejs", { error: "Course name does not exist!" });
            }
        }
    } catch (err) {
        console.error(err);
        res.render("delete-course.ejs", { error: "Something went wrong!" });
    }
});


router.get('/update-course', (req, res) => {
    res.render("update-course.ejs", { error: null });
});

router.post('/editcourse', async (req, res) => {
    const { course_id, old_course_name, new_course_name, new_credits } = req.body;

    try {
        // Check if the course exists
        const checkResult = await db.query(
            `SELECT * FROM ${process.env.COURSE_TABLE} 
             WHERE ${process.env.COURSE_NAME_COLUMN} = $1`, 
            [old_course_name]
        );

        if (checkResult.rows.length === 0) {
            return res.render("update-course.ejs", { error: "Course not found!" });
        }

        // Update both name and credits
        await db.query(
            `UPDATE ${process.env.COURSE_TABLE} 
             SET ${process.env.COURSE_NAME_COLUMN} = $1, 
                 ${process.env.COURSE_CREDITS_COLUMN} = $2 
             WHERE ${process.env.COURSE_ID_COLUMN} = $3`, 
            [new_course_name, new_credits, course_id]
        );

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("update-course.ejs", { error: "Something went wrong!" });
    }
});


export default router;
