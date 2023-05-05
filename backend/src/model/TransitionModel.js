import mongoose from 'mongoose';

import * as Constants from "../constants"

const Schema = mongoose.Schema

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
  refId: { type: Schema.Types.ObjectId, required:[true, "Ref-Id is a required field"] },
  userId: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  status: {
    type: Number,
    min: 13,
    max: 15,
    default: Constants.WAIT 
    // export const WAIT           = 13;
    // export const APPROVED       = 14;
    // export const REJECT         = 15;
  }
},
{
    timestamps: true
})

const Transition = mongoose.model('transition', transitionSchema,'transition')
export default Transition