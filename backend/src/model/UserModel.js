import mongoose from 'mongoose';

const Schema = mongoose.Schema

import { AMDINISTRATOR, AUTHENTICATED } from "../constants"

const SubscriberInput = new Schema({
  userId: { type: Schema.Types.ObjectId, required:[true, "User-ID is a required field"]},
  createdAt : { type : Date, default: Date.now },
  updatedAt : { type : Date, default: Date.now },
})

const userSchema = new Schema({
  username: { type: String, required:[true, "Username Request is a required field"] },
  password: { type: String, required:[true, "Password Request is a required field"] },
  email: { type: String, unique: true, required:[true, "Email Request is a required field"] },
  displayName: { type: String, required:[true, "Email Request is a required field"]},
  banks: [{ 
            bankId: { type: String, required:[true, "Bank-Id Request is a required field"] },
            bankNumber: { type: String, required:[true, "Bank-Number Request is a required field"] } 
          }],
  roles: [{ type: String,
            enum : [AUTHENTICATED, AMDINISTRATOR],
            default: AUTHENTICATED
          }],
  isActive: { type: String },
  avatar :{
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
  },
  lastAccess : { type : Date, default: Date.now },
  isOnline: {type: Boolean, default: false},
  socialType:{
    type: String,
    enum : ['website','facebook', 'google', 'github'],
    default: 'website'
  }, 
  lockAccount: {
    lock: { type: Boolean, default: false },
    date: { type : Date, default: Date.now },
  },
  subscriber: [SubscriberInput],
  socialId: { type: String },
  socialObject: { type: String },
},
{
    timestamps: true
})

const User = mongoose.model('user', userSchema,'user')
export default User