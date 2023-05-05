import mongoose from 'mongoose';

const Schema = mongoose.Schema

var User = new Schema({
    username: { type: String },
})

var Comment = new Schema({
    text: { type: String },
})

var File = new Schema({
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
})

var BInput = new Schema({
    name: { type: String },
    description: { type: String },
    isPublish: { type: Number },
})

var PostBank  = new Schema({
    bankAccountName: { type: String },
    bankId: { type: String },
})

const postSchema = new Schema({
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
},
{
    timestamps: true
})

const Post = mongoose.model('post', postSchema,'post')
export default Post