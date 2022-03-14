//Import
const express = require('express')
const app = express()
const port = 5001
const mysql = require('mysql')
const bodyparser = require('body-parser');
const encoder = bodyparser.urlencoded({ extended: false });
const multer = require('multer');
const storage = require('node-sessionstorage');
const { json }  = require('body-parser');
let auth = false;
const upload = multer({
    storage: multer.memoryStorage()
})

//connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "notes"

});


//connect to database

connection.connect(function(err) {
    if (err) {
        console.log("error", err)
    } else console.log("Database connected")
})


//Static files

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/Assets', express.static(__dirname + 'public/Assets'))

//Set Ejs

app.set('views', './views')
app.set('view engine', 'ejs')

//Notes

app.get('/', (req, res) => {
    res.render('login')
})
app.get('/register', (req, res) => {
    res.render('register')
})



//Register
app.post("/register", encoder, upload.single("profile"), function(req, res) {
    var username = req.body.new_name;
    storage.setItem('loginuser', username)
    var new_user = req.body.new_name;
    var new_email = req.body.new_email;
    var new_password = req.body.new_password;
    console.log(image)
    if (new_user == "" || new_email == "" || new_password == "" || req.file.filename == "") {
        res.render('register', { error: "Please fill the form Correctly" })
    }
    if (new_password.length < 6) {
        res.render('register', { error: "Password Should be more than 6 Characters" })
    } else {
        var image = req.file.buffer.toString('base64');
        connection.query(`insert into loginuser(user_name) values(?)`, [username]);

        connection.query(`create table if not exists ${new_user}(id int not null primary key AUTO_INCREMENT,user_name varchar(255),user_pass varchar(255),user_email varchar(255),user_profile longtext,title varchar(255),content longtext,date varchar(255),fav varchar(255))`);

        connection.query(`insert into ${new_user}(user_name,user_pass,user_email,user_profile) values(?,?,?,?)`, [new_user, new_password, new_email, image], function(err) {
            if (err) {
                res.render('register', { error: "Invalid Username or Password" })
            } else {
                 res.redirect("/home");
                 auth = true;
                 }
            res.end();
        })
    }

})

//Login

app.post("/", encoder, function(req, res) {
    var username = req.body.username;
    storage.setItem('loginuser', username)
    var email = req.body.email;
    var password = req.body.password;

    connection.query(`select user_name from loginuser where user_name like "${username}"`, function(err, rows) {
        console.log(err, rows)
        rows.forEach(function(ans) {
            storage.setItem("con", ans.user_name)
        })
    })
    connection.query(`select * from loginuser where user_name like "${username}"`, function(err) {
        if (err) {
            res.render('login', { error: "Invalid Username or Password" })
            console.log(err)
        } else {
            if (storage.getItem('con') == username) {
                console.log("one clear")
                connection.query(`select * from ${username} where user_email = ? and user_pass = ?`, [email, password], function(error, result, feilds) {
                    if (result.length > 0) {
                        res.redirect("/home")
                        auth = true;
                        console.log("hello login")
                    } else if (error) {
                        res.render('login', { error: "Invalid Username or Password" })
                        console.log(error)
                    } else {
                        res.render('login', { error: "Invalid Username or Password" })
                    }
                    res.end();
                })
            } else {
                res.render('login', { error: "Invalid Username or Password" })

            }

        }
    })

})


//Render-Notes
app.get('/home', (req, res) => {
    if(auth){
        
        var proname = storage.getItem('loginuser');
        connection.query(`select * from ${proname}`, function(err, row) {
            if (err) {
                res.redirect('/')
            } else {
                res.render('home', {
                    users: row
                })
            }
        })
    }
    else{
        res.redirect('/')
    }
   


})

//Add-Notes
app.get('/new',(req,res)=>{
   if(auth){
    var proname = storage.getItem('loginuser');
    connection.query(`select * from ${proname}`, function(err, row) {
        if (err) {
            res.redirect('/')
        } else {
            res.render('new', {
                users: row
            })
        }
    })
   }
   else{
       res.redirect('/')
   }
})
app.post('/add', encoder, (req, res) => {
    var date = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    let title = req.body.title
    let content = req.body.content
    var proname = storage.getItem('loginuser');
    // let data = {name:req.body.new_name,url:req.body.new_url,descs:req.body.desc}
    connection.query(`insert into ${proname}(title,content,date) values(?,?,?)`, [title, content,date], function(err) {
        if (err) {
            res.redirect('/')
            console.log(err)
        } else {
            res.redirect('/home')
        }
    })
})
app.get('/edit/:userId', (req, res) => {
    if(auth){
        var proname = storage.getItem('loginuser');
    const userId = req.params.userId;
    connection.query(`select * from ${proname} where id = ? `, [userId], function(err, result) {
        if (err) {
            res.redirect('/')
        } else {
            res.render('edit', {
                user: result[0]
            })
        }
    })
    }
    else{
        res.redirect('/')
    }
})
//update-note

app.post('/update', encoder, (req, res) => {
    var proname = storage.getItem('loginuser');
    let title = req.body.title
    let content = req.body.content
    let id= req.body.id;
    // let data = {name:req.body.new_name,url:req.body.new_url,descs:req.body.desc}
    connection.query(`update ${proname} set title=?,content=? where id = ${id}`, [title,content], function(err) {
        if (err) {
            res.redirect('/')
        } else {
            res.redirect('/home')
        }
    })

})

//Delete-Note


app.get('/delete/:userId', (req, res) => {
  if(auth){
    var proname = storage.getItem('loginuser');
    const userId = req.params.userId;
    connection.query(`delete from ${proname} where id = ?`, [userId], function(err, result) {
        if (err) {
            res.redirect('/')
        } else {
            res.redirect('/home')
        }
    })
  }
  else{
      res.render('/')
  }
})


//vierw

app.get('/view/:userId', (req, res) => {
  if(auth){
    var proname = storage.getItem('loginuser');
    const userId = req.params.userId;
    connection.query(`select * from ${proname} where id = ? `, [userId], function(err, result) {
        if (err) {
            res.redirect('/')
        } else {
            res.render('view', {
                user: result[0]
            })
        }
    })
  } 
  else{
    res.redirect('/')
  }
})

app.get('/account',(req,res)=>{
   if(auth){
    var proname = storage.getItem('loginuser');
    connection.query(`select * from ${proname}`, function(err, row) {
        if (err) {
            res.redirect('/')
        } else {
            res.render('account', {
                users: row
            })
        }
    })
   }
   else{
       res.redirect('/')
   }
})


//fav
let fav = true;

app.get('/fav/:userId', (req, res) => {
    if(auth){
      var proname = storage.getItem('loginuser');
      const userId = req.params.userId;
        if(fav == true){
            connection.query(`update ${proname} set fav="false" where id = ${userId}`, function(err, result) {
                if (err) {
                    res.redirect('/')
                } else {
                   res.redirect('/home')
                    console.log(result)
                }
                fav = false;
            })
        }
        else{
            connection.query(`update ${proname} set fav="true" where id = ${userId}`, function(err, result) {
                if (err) {
                    res.redirect('/')
                } else {
                   res.redirect('/home')
                    console.log(result)
                }
            })
            fav= true;
        }
    }
    else{
        res.render('/')
    }
})
app.get('/favorite', (req, res) => {
    if(auth){
        var proname = storage.getItem('loginuser');
        connection.query(`select * from ${proname} where fav like "true"`, function(err, row) {
            if (err) {
                res.redirect('/')
            } else {
                res.render('fav', {
                    users: row
                })
            }
        })
    }
    else{
        res.redirect('/')
    }
})
  
//Listen on port 5050
app.listen(port, () => console.log("listening"))
