import mongoose from 'mongoose';
const Schema = mongoose.Schema
const withdrawSchema = new Schema({
  bank: [{ 
    bankId: { type: String, required:[true, "Bank-Id Request is a required field"] },
    // bankNumber: { type: String, required:[true, "Bank-Number Request is a required field"] } 
  }],
  balance: { type: Number, default: 0 },
  userIdRequest: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  userIdApprove: { type: Schema.Types.ObjectId },
  status:{
    type: String,
    enum : ['wait','approved', 'reject'],
    default: 'wait'
  }, 
},
{
    timestamps: true
})

const Withdraw = mongoose.model('withdraw', withdrawSchema,'withdraw')
export default Withdraw