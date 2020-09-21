import mongoose from 'mongoose'

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String
}, {timestamp: true})

export default mongoose.model('messagecontent', whatsappSchema)