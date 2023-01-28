import mongoose from 'mongoose';
const Schema = mongoose.Schema

/*
  - จำนวนเงิน
  - วันที่โอนเงิน ชม/นาที
  - สลิปการโอน

   balance: 100,
berthong-backend-1   |   dateTranfer: '2023-01-04T17:00:00.000Z',
berthong-backend-1   |   files
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
        type: String,
        enum : ['wait','approved', 'reject'],
        default: 'wait'
    }, 
},
{
    timestamps: true
})

const Deposit = mongoose.model('deposit', depositSchema,'deposit')
export default Deposit