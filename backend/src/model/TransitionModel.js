import mongoose from 'mongoose';
const Schema = mongoose.Schema

const transitionSchema = new Schema({
  type:{
    type: String,
    enum : ['supplier', 'deposit', 'withdraw'],
    default: 'supplier'
  }, 
  refId: { type: Schema.Types.ObjectId, required:[true, "Ref-Id is a required field"] },
  userId: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  status: {
    type: String,
    enum : ['success', 'cancel'],
    default: 'success'
  },
},
{
    timestamps: true
})

const Transition = mongoose.model('transition', transitionSchema,'transition')
export default Transition