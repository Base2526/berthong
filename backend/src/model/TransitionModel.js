import mongoose from 'mongoose';

import * as Constants from "../constants"

const Schema = mongoose.Schema

const transitionSchema = new Schema({
  type:{
    type: Number,
    min: 0,
    max: 2,
    default: Constants.SUPPLIER // 0: 'supplier', 1: 'deposit',  2: 'withdraw'
  }, 
  refId: { type: Schema.Types.ObjectId, required:[true, "Ref-Id is a required field"] },
  userId: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
  status: {
    type: Number,
    min: 0,
    max: 1,
    default: Constants.OK // 0 : cancel, 1 : ok
  }
},
{
    timestamps: true
})

const Transition = mongoose.model('transition', transitionSchema,'transition')
export default Transition