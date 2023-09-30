import mongoose from 'mongoose';
const Schema = mongoose.Schema

var payloadSchema  = new Schema({
    src: { type: String },
    alt: { type: String },
    width: { type: String }
})

const messageSchema = new Schema({
    _id: { type: Schema.Types.ObjectId },
    conversationId: { type: Schema.Types.ObjectId },
    type: { type: String },
    message: { type: String },
    sentTime: { type: String },
    senderName: { type: String },
    senderId: { type: String },
    direction: { type: String },
    position: { type: String },
    status: { type: String },
    reads: [String],

    payload: [payloadSchema]
},
{ timestamps: true })

const Message = mongoose.model('message', messageSchema,'message')

export default Message