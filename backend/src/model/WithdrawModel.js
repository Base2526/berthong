import mongoose from 'mongoose';

import * as Constants from "../constants"

const Schema = mongoose.Schema
const withdrawSchema = new Schema({
  // bank: { type: Schema.Types.ObjectId, required:[true, "Bank-Id Request is a required field"] },
  bank:{
    _id: { type: Schema.Types.ObjectId, required:[true, "Bank-id Request is a required field"] },
    bankId: { type: Schema.Types.ObjectId, required:[true, "Bank-id Request is a required field"] },
    bankNumber:  { type: String, required:[true, "Bank account number Request is a required field"] }
  },
  balance: { type: Number, default: 0 },
  userIdRequest: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  userIdApprove: { type: Schema.Types.ObjectId },
  status:{
    type: Number,
    min: 0,
    max: 2,
    default: Constants.WAIT // 0: 'wait', 1: 'approved',  2: 'reject'
  }, 
},
{
    timestamps: true
})

const Withdraw = mongoose.model('withdraw', withdrawSchema,'withdraw')
export default Withdraw