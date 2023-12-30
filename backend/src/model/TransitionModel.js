import mongoose from 'mongoose';

import * as Constants from "../constants"

const Schema = mongoose.Schema

var File = new Schema({
  url: { type: String },
  filename: { type: String },
  mimetype: { type: String },
  encoding: { type: String },
})

const transitionSchema = new Schema({
  type:{
    type: Number,
    min: 10,
    max: 12,
    default: Constants.SUPPLIER 
    // export const SUPPLIER       = 10;
    // export const DEPOSIT        = 11;
    // export const WITHDRAW       = 12;
  }, 
  refId: { type: Schema.Types.ObjectId, required:[true, "Ref-Id is a required field"] }, // It's supplierId
  userId: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  status: {
    type: Number,
    min: 13,
    max: 15,
    default: Constants.WAIT 
    // export const WAIT           = 13;
    // export const APPROVED       = 14;
    // export const REJECT         = 15;
  },
  expire: { type: Boolean, default: false }, 
  isLucky: { type: Boolean, default: false },
  statusPay: {
    type: Number,
    min: 13,
    max: 15,
    default: Constants.WAIT 
  },
  files: [File], // Recipt file when we tranfer mony to customer if lucky
  description: { type: String },
},
{
    timestamps: true
})

const Transition = mongoose.model('transition', transitionSchema,'transition')
export default Transition