import mongoose from 'mongoose';

import * as Constants from "../constants"

const Schema = mongoose.Schema
const withdrawSchema = new Schema({
  bankId: { type: Schema.Types.ObjectId, required:[true, "Bank-Id Request is a required field"] },
  balance: { type: Number, default: 0 },
  userIdRequest: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  userIdApprove: { type: Schema.Types.ObjectId },
  status:{
    type: Number,
    min: 13,
    max: 15,
    default: Constants.WAIT 
  }, 
  message:{type: String}
},
{
    timestamps: true
})

const Withdraw = mongoose.model('withdraw', withdrawSchema,'withdraw')
export default Withdraw