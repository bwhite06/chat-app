const express = require('express');
const helmet = require('helmet');
const knex = require('knex');
const server = express();
const knexConfig = require('./knexfile.js')
const db = knex(knexConfig.development)
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken' );
const jwtKey = require('./_secrets/keys.js').jwtKey;
const { authenticate } = require('./middleware.js');


server.use(cors());
server.use(helmet());
server.use(express.json())

server.get('/',(req,res)=>{
  res.send('active')

});
// ===Get aLL users in db===
server.get('/api/users',(req,res)=>{
  db('users')
  .then(users=>{
    res.status(200).json(users);
  })
  .catch(err=>{
    res.send(err);
  })
});
//===Login===
server.post('/api/login',(req, res) => {

  const credentials = req.body;
  console.log(credentials)
  db('users').where({username: credentials.username}).first()
.then(users=>{
  console.log(users)
  if(users&&bcrypt.compareSync(credentials.password,users.password)){
    const token = generateToken(users);
       res.status(200).json({welcome: users.username, token})
  }else {
      res.status(401).json({
        message:'Invaild Entry'
      })
    }
  })
  .catch(err=>{
    res.send(err)
  });

});
// ===Register===
server.post('/api/register',(req,res)=>{
const {username,password,email} = req.body;
const role = 'ordinary';
const status =true;
const newUser ={username,password,email,role,status};
const hash =bcrypt.hashSync(newUser.password,14)

newUser.password  = hash;
  db('users').insert(newUser)
  .then(ids=>{
    const id =ids[0];
    const token = generateToken(newUser);
    res.status(201).json({welcome:newUser.username, token})
  })
  .catch(err=>{
    res.status(500).json(err)
  })
})

// ===Send message===
server.post('/api/message',authenticate,(req,res)=>{
const {reply,ip,user_two} = req.body;
const user_one = req.decoded.user_id;
const users = {user_one, user_two,ip};
const user_id_fk = user_one;

db.transaction(trx => {
  return trx('conversation')
    .insert(users)
    .then(
      (ids) => {
        console.log(ids);

        const message={reply,ip,user_id_fk};
        console.log(message);
     return trx('conversation_reply').insert(message).then(ids=>{
         const id =ids[0];
     }).catch(err=>{
       res.status(500).json(err);
     })
    });
})
.then(() => {
  console.log('inserted');
})
.catch(err => {
  console.log('rolled back',err)
});
});



const jwtSecrect = "Why";
function generateToken(user){


  const jwtpayload = {
    user_id:user.user_id,
    username:user.username,
    password:user.password,
    hello:'welcome',

  };


  const jwtOptions= {
    expiresIn: '10m',
  }
  return jwt.sign(jwtpayload,jwtSecrect,jwtOptions)
}

//message board
server.get('/api/getmessage',authenticate,(req,res)=>{
console.log(req.body.username);
db('conversation').select('user_two').then(function(user_two){
console.log(user_two);
  db('users').where({user_id: req.decoded.user_id}).then(function(user){
      // Do something with the user
      db.select('reply','created_at','username').from('users').innerJoin('conversation_reply','user_id_fk','=','user_id').then(message => {
      console.log(message);


          res.status(200).json(message)
        }).catch(err=>{
          res.status(500).json(err)
        })
  }).catch(err=>{
    res.status(500).json(err)
  });
});

});

server.get('/api/user',authenticate,(req,res)=>{
  console.log(req.decoded.user_id);
  db('users').where({user_id: req.decoded.user_id})
  .then(user=>{
    console.log(user);
    res.status(200).json(user)
  }).catch(err=>{
    res.status(500).json(err)
  })
});






const port = 3301;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
