import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "izm96dhhnwr2ieg0.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "llxog34wkoifo03e",
    password: "l9rjsy53pxkcvob5",
    database: "f4h7xzmqz65vtwor",
    connectionLimit: 10,
    waitForConnections: true
});
//routes
app.get('/', (req, res) => {
   res.render('home.ejs')
});

//Gets all quotes from database and display them
app.get('/quotes', async(req, res) => {
   let sql = `SELECT quoteId, quote
              FROM quotes
              ORDER BY quote`;
   const [quotes] = await pool.query(sql);           
   res.render('quotes.ejs', {quotes})
});

//Getting all info for a specific quote based on the quoteId
app.get('/updateQuote', async(req, res) => {
   let quoteId = req.query.quoteId;
   let sql = `SELECT *
              FROM quotes
              WHERE quoteId = ?`;
   const [quoteInfo] = await pool.query(sql, [quoteId]);              

   let sql2 = `SELECT authorId, firstName, lastName
               FROM authors
               ORDER BY lastName`;
   const [authorList] = await pool.query(sql2);  
   
   let sql3 = `SELECT DISTINCT category
               FROM quotes
               ORDER BY category`;
   const [categoryList] = await pool.query(sql3);
           
   res.render('updateQuote.ejs', {quoteInfo, authorList, categoryList})
});


app.get('/authors', async (req, res) => {
   let sql = `SELECT authorId, firstName, lastName
              FROM authors
              ORDER BY lastName`;
    const [authors] = await pool.query(sql); 
    console.log(authors);              
   res.render('authors.ejs', {authors})
});

//Displays the form to update an existing author
app.get('/updateAuthor', async (req, res) => {
   let authorId = req.query.authorId;
   let sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d') ISOdob, DATE_FORMAT(dod, '%Y-%m-%d') ISOdod
              FROM authors
              WHERE authorId = ?`;
   const [authorInfo] = await pool.query(sql, [authorId]); 
   res.render('updateAuthor.ejs', {authorInfo})
});

app.post('/updateAuthor', async (req, res) => {
   let firstName = req.body.firstName;
   let lastName = req.body.lastName;
   let dob = req.body.dob;
   let dod = req.body.dod;
   let sex = req.body.sex;
   let bio = req.body.bio;
   let profession = req.body.profession;
   let country = req.body.country;
   let portrait = req.body.portrait;
   let authorId = req.body.authorId;

   let sql = `UPDATE authors
              SET firstName = ?,
                  lastName = ?,
                  dob = ?,
                  dod = ?,
                  sex = ?,
                  biography = ?,
                  profession = ?,
                  country = ?,
                  portrait = ?
              WHERE authorId = ?`;

   let sqlParams = [firstName, lastName, dob, dod, sex, bio, profession, country, portrait, authorId];
   await pool.query(sql, sqlParams);

   res.redirect('/authors');
});

//route to display the form to add a new author
app.get('/addAuthor', (req, res) => {
   res.render('addAuthor.ejs')
});

//route to save the author info into the database
app.post('/addAuthor', async (req, res) => {

    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let dob = req.body.dob;
    let dod = req.body.dod;
    let sex = req.body.sex;
    let bio = req.body.bio;
    let profession = req.body.profession;
    let country = req.body.country;
    let portrait = req.body.portrait;

    let sql = `INSERT INTO authors
               (firstName, lastName, dob, dod, sex, biography, profession, country, portrait)
               VALUES
               (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    let sqlParams = [firstName, lastName, dob, dod, sex, bio, profession, country, portrait];

    await pool.query(sql, sqlParams);

    res.redirect('/authors');
});

app.get('/deleteAuthor', async (req, res) => {
    let authorId = req.query.authorId;
    let sql = `SELECT *
               FROM authors
               WHERE authorId = ?`;
    const [authorInfo] = await pool.query(sql, [authorId]); 
    res.render('deleteAuthor.ejs', {authorInfo})
});

app.post('/deleteAuthor', async (req, res) => {
    let authorId = req.body.authorId;

    let sql = `DELETE FROM authors
               WHERE authorId = ?`;
    let sqlParams = [authorId];

    const [rows] = await pool.query(sql, sqlParams);


   res.redirect('/authors');

});
//route to display the form to add a new quote
app.get('/addQuote', (req, res) => {

    //get list of authors
    //get list of categories

   res.render('addQuote.ejs')
});


app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})
