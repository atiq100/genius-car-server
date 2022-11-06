const express = require('express');
const cors = require('cors');
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

async function run(){

    try{
        const serviceCollection = client.db('geniusCar').collection('services');
        const orderCollection = client.db('geniusCar').collection('orders');
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


        //order dekte cai as a login user

        app.get('/orders',async(req,res)=>{
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
        app.post('/orders', async(req,res)=>{
            const order = req.body;
            const result =await orderCollection.insertOne(order);
            res.send(result)
        })

        //update
        app.patch('/orders/:id', async(req,res)=>{
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
        app.delete('/orders/:id',async(req,res)=>{
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