import mongoose from 'mongoose';

import * as Constants from "../constants"

const Schema = mongoose.Schema

/*
  - จำนวนเงิน
  - วันที่โอนเงิน ชม/นาที
  - สลิปการโอน
*/

var File = new Schema({
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
})
const depositSchema = new Schema({
    balance: { type: Number, default: 0 },
    dateTranfer : { type : Date, default: Date.now },
    userIdRequest: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
    userIdApprove: { type: Schema.Types.ObjectId },
    files: [File],
    status:{
        type: Number,
        min: 0,
        max: 2,
        default: Constants.WAIT // 0: 'wait', 1: 'approved',  2: 'reject'
    }, 
    bank:{
        _id: { type: Schema.Types.ObjectId, required:[true, "Bank-id Request is a required field"] },
        bankId: { type: Schema.Types.ObjectId, required:[true, "Bank-id Request is a required field"] },
        bankNumber:  { type: String, required:[true, "Bank account number Request is a required field"] }
    }
},
{
    timestamps: true
})

const Deposit = mongoose.model('deposit', depositSchema,'deposit')
export default Deposit