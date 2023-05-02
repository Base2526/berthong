import mongoose from 'mongoose';

import * as Constants from "../constants"

const Schema = mongoose.Schema
const withdrawSchema = new Schema({
  bankId: { type: Schema.Types.ObjectId, required:[true, "Bank-Id Request is a required field"] },
  // bank:{
  //   _id: { type: Schema.Types.ObjectId, required:[true, "Bank-id Request is a required field"] },
  //   bankId: { type: Schema.Types.ObjectId, required:[true, "Bank-id Request is a required field"] },
  //   bankNumber:  { type: String, required:[true, "Bank account number Request is a required field"] }
  // },
  balance: { type: Number, default: 0 },
  userIdRequest: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  userIdApprove: { type: Schema.Types.ObjectId },
  status:{
    type: Number,
    min: 13,
    max: 15,
    default: Constants.WAIT 

    // export const WAIT           = 13;
    // export const APPROVED       = 14;
    // export const REJECT         = 15;
  }, 
},
{
    timestamps: true
})

const Withdraw = mongoose.model('withdraw', withdrawSchema,'withdraw')
export default Withdraw