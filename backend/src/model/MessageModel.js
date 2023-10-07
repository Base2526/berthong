import mongoose from 'mongoose';
import * as Constants from "../constants"

const Schema = mongoose.Schema

var payloadSchema  = new Schema({
    src: { type: String },
    alt: { type: String },
    width: { type: String }
})

const messageSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required:[true, "_id is a required field"] },
    conversationId: { type: Schema.Types.ObjectId, required:[true, "Conversation-Id is a required field"] },
    type: { type: String },
    message: { type: String },
    sentTime: { type: String },
    senderName: { type: String },
    senderId: { type: Schema.Types.ObjectId, required:[true, "Sender-Id is a required field"] },
    direction: { type: String },
    position: { type: String },
    status: {
                type: Number,
                enum : [0, Constants.STATUS_SENT, Constants.STATUS_DELIVERED, Constants.STATUS_FAILED], // 50: STATUS_SENT, 51: STATUS_DELIVERED, 52: STATUS_FAILED
                default: 0
            },
    reads: [String],
    payload: [payloadSchema]
},
{ timestamps: true })

const Message = mongoose.model('message', messageSchema,'message')

export default Message

/*

 kind:{
        type: Number,
        enum : [0, 1, 2], // 0: thai, 1: laos, 2: vietnam
        default: 0
    },*/