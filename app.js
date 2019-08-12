const express = require('express')
const bodyParser = require('body-parser')
const redis  = require('redis')

//  set redis client
let client = redis.createClient()
  
client.on('connect', () => {
  console.log('connected to redis');
})

const port = 3000

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req,res) => {
  const response = {status: "ok"}
  res.json(response)
})

app.post('/user/search', async (req, res) => {
  let id = req.body.id
  await client.hgetall(id, (err, obj) => {
    if(!obj) {
      res.json({message: 'user does not exist', err})
    } else {
      res.json({user: obj})
    }
  })

})

app.post('/user/add', async (req, res) => {
  console.log(req.body)
  const id = req.body.id
  const name = req.body.name
  const address = req.body.address

  await client.hmset(id, [
    'name', name,
    'address', address
  ], (err, reply) => {
    if(err) {
      console.log(err)
      res.status(500).json({message: 'Fail to save user'})
    }
    console.log(reply)
    res.json({message: "user added"})
  })
})


app.delete('/user/delete/:id', async (req, res) => {
  const id = req.params.id
  console.log(id)
  await client.del(id)
  res.json({message: 'user deleted'}) 
})

app.listen(port, () => {
  console.log(`app run on port ${port}`);
})