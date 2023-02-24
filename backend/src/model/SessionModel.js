import mongoose from 'mongoose';

const Schema = mongoose.Schema
const sessionSchema = new Schema({
  userId: {  type: Schema.Types.ObjectId, required:[true, "User-Id is a required field"]  },
  token: { type: String, required:[true, "Token is a required field"] },
  deviceAgent: { type: String },
  expired: { type : Date, default: +new Date() + 30*24*60*60*1000, required:[true, "Expired is a required field"] } // 30 จำนวนวันที่ จะ expired
},
{
    timestamps: true
})

const Session = mongoose.model('session', sessionSchema,'session')
export default Session