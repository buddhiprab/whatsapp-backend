//importing
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'
import logger from 'morgan'

//app config
const app = express()
const port = process.env.PORT || 9000

var pusher = new Pusher({
    appId: '1076851',
    key: '6b62fa92264becab2041',
    secret: '272ec0aafa24815782e4',
    cluster: 'ap1',
    encrypted: true
});

//middelware
app.use(logger('dev'));
app.use(express.json());
app.use(cors())

//DB config
mongoose.connect('mongodb+srv://whatsappuser:whatsapppass@cluster0.eqwqm.mongodb.net/whatsappdb?retryWrites=true&w=majority',
    {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    },(res) => {
        console.log('connected to db')
    })

const db = mongoose.connection

db.once("open", () => {
    console.log('db connected')
    const messageContentCollection = db.collection("messagecontents");
    const changeStream = messageContentCollection.watch()
    changeStream.on("change", (change) => {
        console.log('change', change)
        if(change.operationType==='insert') {
            const messageDetails = change.fullDocument
            pusher.trigger('messages',
                'inserted',
                messageDetails,
                (err) => {
                    console.log(err)
                })
        }
    })
})

//api routes
app.get('/', (req, res) => {
    res.status(200).send('hello world')
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if(err) {
            res.send(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

//listen
app.listen(port, () => console.log(`Listening on localhost: ${port}`))