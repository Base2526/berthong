import mongoose from 'mongoose';
const Schema = mongoose.Schema

const transitionSchema = new Schema({
  type:{
    type: String,
    enum : ['buy_lottery', 'cancel_lottery', 'withdraw'],
    default: 'buy_lottery'
  }, 
  refId: { type: Schema.Types.ObjectId, required:[true, "Ref-Id is a required field"] },
  userIdRequest: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  userIdApprove: { type: Schema.Types.ObjectId },
},
{
    timestamps: true
})

const Transition = mongoose.model('transition', transitionSchema,'transition')
export default Transition