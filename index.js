const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeaders = req.headers.authorization;
    if(!authHeaders){
        return res.status(401).send({message: 'Unauthorized access'})
    }
    const token = authHeaders.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).send({message: 'forbidden access'})
        }
        console.log('decoded', decoded);
        req.decoded=decoded;
        next();
    })
        
}
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.baljp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db("geniusCar").collection("services")
        const orderCollection = client.db("geniusCar").collection("order")

        //post
        app.post('/login', async (req, res) =>{
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn : '1d'
            })
            res.send({accessToken});
        })

        // get service
        app.get('/service', async (req, res) =>{
        const query ={}
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
        })
        //get 
        app.get('/service/:id' , async (req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        //post
         app.post('/service', async (req, res) =>{
            const newService = req.body;
            const result= await serviceCollection.insertOne(newService);
            res.send(result);
         })
         
    //delete
        app.delete('/service/:id', async (req, res) =>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })

    // order post 
    app.post('/order', async(req, res) => {

        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.send(result);
    })
    // order get
    app.get('/order' ,verifyJWT, async(req, res) => {
        const decodedEmail = req.decoded.email
        const email = req.query.email;  
       if (email === decodedEmail) {
        const query = {email: email};
        const cursor =  orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
       }
    })
    }
    finally{

    }
}

run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('Running my node CRUD server')
})

app.listen(port, () => {
    console.log('crud server is running');
})