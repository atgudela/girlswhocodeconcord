import pg from 'pg';
import bcrypt from 'bcrypt';
import url, {fileURLToPath} from 'url';
import session from 'express-session'
import path from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saltRounds = 2;

let pool = new pg.Pool({
    host:'mbcs.duckdns.org',
    port:'5432',
    user:'b_gutierrezdelasse',
    password:'b_gutierrezdelasse',
    database:'b_gutierrezdelasse',
});


import Express from 'express';
import bodyParser from 'body-parser';

let app = Express();
//app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(Express.static("../client"));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'monkeylikesbananas'
}))

let router = Express.Router();

pool.connect().then((client) => {

    let username_query =  `SELECT id, name, hashed_password, salt, plaintext_password from Users`;

    client.query(username_query)
        .then((results) => {

            console.log(results.rows)})})

router.post("/login", (request, response) => {
    let attempted_user = request.body.login;
    let attempted_password = request.body.password;
    let admin = request.query.admin;
    if (attempted_user === undefined || attempted_password === undefined) {
        response.status(400);
        response.json({"message": "Invalid request, please supply both a username and password."})
        response.send();
    } else {
        pool.connect().then((client) => {

            let username_query =  `SELECT id, name, hashed_password, salt, plaintext_password
                                   FROM Users
                                   WHERE name='${attempted_user}' and plaintext_password='${attempted_password}'`;
            let admin_query = `SELECT * FROM admins WHERE name='${attempted_user}' and plaintext_password='${attempted_password}'`

            client.query(admin ? admin_query : username_query)//ternary operator replace if(){}else{}
                .then((results) => {

                    if(results.rows[0]){
                        response.status(200);
                        request.session.user = {admin,...results.rows[0]}

                        response.json(admin ? {admin,...results.rows[0]} : {"id":results.rows[0].id,"name": results.rows[0].name})
                    }else{
                            response.status(401);
                            let ret = {"message": "Username does not exist!"};
                            response.json(ret);
                    }
                    client.release();
                })
        })
    }
})
router.post("/signup",async (request,response)=>{
    let attempted_user = request.body.login;
    let attempted_password = request.body.password;

    let salt = request.body.token;
    if (attempted_user === undefined || attempted_password === undefined) {
        response.status(400);
        response.json({"message": "Invalid request, please supply both a username and password."})
        response.send();
    } else {
        let result = await bcrypt.compare(attempted_user, salt)
        console.log(result)
        if(result) {
            let hashed_password = await bcrypt.hash(attempted_password, 5)
            console.log(hashed_password)
            pool.connect().then((client) => {


                let createUser = `
                    INSERT INTO Users (name,hashed_password,salt,plaintext_password)
                    VALUES ('${attempted_user}', '${hashed_password}', '5', '${attempted_password}');
                    SELECT currval(pg_get_serial_sequence('Users','id'));
                `;
                client.query(createUser)
                    .then((results) => {
                        if (results) {
                            let id = results[1].rows[0].currval;
                            request.session.user = {id,attempted_user, hashed_password,attempted_password}
                            console.log(results[1].rows[0].currval)
                            response.status(200);
                            //response.redirect(url.format({
                            //    pathname:"/dashboard.html",
                            //    query: {
                            //        "id": id
                            //    }
                            //}));
                            response.json({id})
                        } else {
                            response.status(401);
                            let ret = {"message": "Username does not exist!"};
                            response.json(ret);
                        }
                        client.release();
                    })
            })
        }else{
            response.status(401).json({message:"signup is not allowed"})
        }
    }

})
router.post("/dashboard",async (request,response)=>{
    if(request.session.user.admin){
        let {contact,description,id,img=null} = request.body;

        if ((contact || description || img) && id) {

            //let result = await bcrypt.compare(attempted_user, salt)
            if (id == request.session.user.id) {

                               let query = `UPDATE admins
                                         SET contact   = '${contact}',
                                             description   = '${description}',
                                             img       = '${img}'
                                         WHERE id = ${id};`

                pool.connect().then((client) => {
                    client.query(query)
                        .then((results) => {
                            if (results) {
                                response.status(200);

                                response.json({"message": "data was added successfully"})
                            } else {
                                response.status(401);
                                let ret = {"message": "Something went wrong try again later!"};
                                response.json(ret);
                            }
                            client.release();
                        })
                })



            } else {
                response.status(401).json({message: "operation is not allowed"})
            }
        } else {
            response.status(400);
            response.json({"message": "Invalid request, please tell us at least smth."})
            response.send();
        }
    }else {
        let hobbies = request.body.hobbies;
        let favBook = request.body.favBook;
        let surpFacts = request.body.surpFacts;
        let extra = request.body.extra;
        let userid = request.body.userid;
        let img = request.body.img;

        if ((hobbies || favBook || surpFacts || extra || img) && userid) {

            //let result = await bcrypt.compare(attempted_user, salt)
            if (userid == request.session.user.id) {

                pool.connect().then((client) => {
                    client.query(`SELECT *
                                  from profiles
                                  WHERE userid = ${userid}`)
                        .then((results) => {
                            let query = ''
                            if (results.rows.length) {
                                query = `UPDATE profiles
                                         SET hobbies   = '${hobbies}',
                                             favBook   = '${favBook}',
                                             surpFacts = '${surpFacts}',
                                             extra     = '${extra}',
                                             img       = '${img}'
                                         WHERE userid = ${userid};`

                            } else {
                                query = `
                                    INSERT INTO Profiles (hobbies, favBook, surpFacts, extra, userid, img)
                                    VALUES ('${hobbies}', '${favBook}', '${surpFacts}', '${extra}', '${userid}', '${img}
                                            ');`;
                            }
                            client.query(query)
                                .then((results) => {
                                    if (results) {
                                        response.status(200);

                                        response.json({"message": "data was added successfully"})
                                    } else {
                                        response.status(401);
                                        let ret = {"message": "Something went wrong try again later!"};
                                        response.json(ret);
                                    }
                                    client.release();
                                })
                        })


                })
            } else {
                response.status(401).json({message: "operation is not allowed"})
            }
        } else {
            response.status(400);
            response.json({"message": "Invalid request, please tell us at least smth."})
            response.send();
        }
    }

})
router.delete("/dashboard/:id",(request,response)=>{
    if(request.session.user.admin){
        let id = request.params.id
        pool.connect().then((client) => {
            client.query(`DELETE FROM profiles WHERE id = ${id}`)
                .then((results) => {
                        console.log(results)
                            if (results) {
                                response.status(200);

                                response.json({"message": "data was added successfully"})
                            } else {
                                response.status(401);
                                let ret = {"message": "Something went wrong try again later!"};
                                response.json(ret);
                            }
                            client.release();

                })




        })
    }else{
        response.status(403).json({message:"operation is not allowed"})

    }
})
router.get("/members", (request,response)=>{
    let query = null
    if(request?.session?.user?.admin){
        query = `SELECT  profiles.hobbies,
                         profiles.favBook,
                         profiles.surpFacts,
                         profiles.extra,
                         profiles.img,
                         profiles.id,
                         users.name
                      FROM profiles
                            JOIN users ON profiles.userid = users.id`
    }else{
        query = `SELECT profiles.hobbies,
                        profiles.favBook,
                        profiles.surpFacts,
                        profiles.extra,
                        profiles.img,
                        users.name
                      FROM profiles
                               JOIN users ON profiles.userid = users.id`
    }
        pool.connect().then((client) => {
            client.query(query)
                .then((results) => {
                    if (results) {
                        response.status(200);
                        /*results.rows.forEach(row=>{
                            row.img = row.img.toString('base64')
                        })*/
                        response.json(results.rows)
                    } else {
                        response.status(401);
                        let ret = {"message": "Something went wrong try again later!"};
                        response.json(ret);
                    }
                    client.release();
                })

        })
})
router.get("/admins", (request,response)=>{
    let query = null
    if(request?.session?.user?.admin){
        query = `SELECT admins.description,
                        admins.role,
                        admins.contact,
                        admins.img,
                        admins.id,
                        admins.name
                        FROM admins`
    }else{
        query = `SELECT admins.description,
                        admins.role,
                        admins.contact,
                        admins.img,
                        admins.name
                      FROM admins`
    }
    pool.connect().then((client) => {
        client.query(query)
            .then((results) => {
                if (results) {
                    response.status(200);
                    /*results.rows.forEach(row=>{
                        row.img = row.img.toString('base64')
                    })*/
                    response.json(results.rows)
                } else {
                    response.status(401);
                    let ret = {"message": "Something went wrong try again later!"};
                    response.json(ret);
                }
                client.release();
            })

    })
})
router.get("/dashboard",(request,response)=>{
    response.sendFile(path.join(__dirname, '../client/club_members.html'))
})
router.get("/admin",(request,response)=>{
    if(request?.session?.user?.admin) {
        response.sendFile(path.join(__dirname, '../client/admin.html'))
    }else{
        response.redirect('/dashboard')
    }
})
router.get('/user',(request,response)=>{

    if(request.session.user) {
        let {id,name} =request.session.user//destructuring
        //let id =request.session.user.id
        //let name =request.session.user.name
        if(request?.session?.user?.admin){
            response.json({user: request?.session?.user})
        }else {
            pool.connect().then((client) => {
                client.query(`SELECT *
                              from profiles
                              WHERE userid = ${id}`)
                    .then((results) => {
                        if (results.rows.length) {
                            let {hobbies,favBook,surpFacts,extra,img} = results.rows[0];
                            response.json({user: {id, name,hobbies,favBook,surpFacts,extra,img}})
                        }else{
                            response.json({user: {id, name}})
                        }
                  client.release();
                    })
            })
        }

    }else{
        response.json(null)
    }
})

router.get('/token',(request,response)=>{
    if(request?.session?.user?.admin) {
        response.sendFile(path.join(__dirname, '../client/token.html'))
    }else{
        response.redirect('/login.html')
    }
})
router.get('/nav',(request,response)=>{
    if(request?.session?.user?.admin){
        response.json({html:` <ul>
        <li><a href="/">GWC </a></li>
        <li><a href="/aboutadmin.html" >ABOUT</a></li>
        <li><a href="/dashboard">MEET THE GIRLS</a></li>
        <li><a href="/projects.html">PROJECTS</a></li>
        <li><a href="/login.html">LOGIN</a></li>
        <li><a href="/token">INVITE</a></li>
        <li><a href="/admin"><img src='/img/person.png' alt="person icon"/></a></li>
    </ul>`})
    }else{
        response.json({html:`<ul>
        <li><a href="/">GWC </a></li>
        <li><a href="/aboutadmin.html" >ABOUT</a></li>
        <li><a href="/dashboard">MEET THE GIRLS</a></li>
        <li><a href="/projects.html">PROJECTS</a></li>
        <li><a href="/login.html">LOGIN</a></li>
    </ul>`})
    }
})

router.get("/generateToken",(req,res)=>{
    let name = req.query.name
    bcrypt.hash(name, saltRounds, function(err, hash) {
        res.status(200).json({invitationToken: hash})
    });
})
router.get("/checkToken",(req,res)=>{
    let {name,token}=req.query
    bcrypt.compare(name, token, function(err, result) {
        if(result){
            res.status(200).json({status:'valid'})
        }else{
            res.status(403).json({status:'not valid'})
        }
    });
})
//todo admin able to create profile? or manually enter into database? db
//todo display the admin profiles

app.use('/', router);

app.listen(9999, () => {
    console.log("Server started (port 9999)");
})
