import mongoose from 'mongoose';

const Schema = mongoose.Schema

const conversationSchema = new Schema({
    name: { type: String },
    lastSenderName: { type: String },
    info: { type: String },
    avatarSrc: { type: String },
    avatarName: { type: String },
    status: { type: String },
    unreadCnt: { type: Number },
    sentTime: { type: Date },
    senderId: { type: String },
    members: [Object],

    // testMembers: Object
    
    // muted: { type: Boolean }, 
    // unread: { type: Number },
    // title: { type: String },
    // subtitle: { type: String },
    // alt: { type: String },
    // avatar: { type: String },
    // date: { type: Date },
},
{
    timestamps: true
})

/*
 title: { type: String },
    nameSubname: { type: String },
    idCard: { type: String },
    amount: { type: Number },
    dateTranfer: { type: Date},
    description: { type: String },
    banks: [PostBank],
    tels: [{ type: String }],
    files: [File],
    follows: [{ type: String }],
    isPublish: { type: String },
    ownerId: {type: String}
*/



const Conversation = mongoose.model('conversation', conversationSchema,'conversation')
export default Conversation