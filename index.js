const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());

//console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6znnq0v.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//jwt verify function
//  function verifyJWT(req,res,next){
//     const authHeader = req.headers.authorization;
//     if(!authHeader){
//      return   res.status(401).send({message: 'unauthorized access'})
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
//         if(err){
//           return  res.status(401).send({message: 'unauthorized access'})
//         }
//         req.decoded = decoded;
//         next()
//     })
// }
function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'}) 
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'}) 
        }
        req.decoded = decoded;
        next()
    })
}

async function run(){

    try{
        const serviceCollection = client.db('geniusCar').collection('services');
        const orderCollection = client.db('geniusCar').collection('orders');

        app.post('/jwt',(req,res)=>{
            const user = req.body;
            //console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
            res.send({token})
        })

        //sob services table ke paite...client e dekanur jonno
        app.get('/services', async(req,res)=>{
            const query = {}//jodi sob data database theke pete cai
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        //specific service data pete
        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)

        })


        //order dekte cai as a login user...order api

        app.get('/orders', verifyJWT, async(req,res)=>{
            const decoded = req.decoded;
            console.log(decoded);
            if(decoded.email !== req.query.email){
                res.status(401).send({message: 'unauthorized access'})
            }
            //console.log(req.headers.authorization);
            let query = {};
            //jodi specific kunu id ba email diye order filter out korte cai
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray()
            res.send(orders);

        })

        //orders api for insert data into database
        app.post('/orders', verifyJWT, async(req,res)=>{
            const order = req.body;
            const result =await orderCollection.insertOne(order);
            res.send(result)
        })

        //update
        app.patch('/orders/:id', verifyJWT, async(req,res)=>{
            const id =req.params.id;
            const status = req.body.status
            const query = {_id: ObjectId(id)}
            const updateDoc = {
                $set:{
                    status: status
                }
            }
            const result = await orderCollection.updateOne(query,updateDoc);
            res.send(result);
        })

        //delete
        app.delete('/orders/:id', verifyJWT, async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result= await orderCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally{

    }

}
run().catch(err => console.log(err))



app.get('/',(req,res)=>{
    res.send('genius car running');
})

app.listen(port,()=>{
    console.log(`genius car running on port ${port}`);
})

//require('crypto').randomBytes(64).toString('hex') for make token