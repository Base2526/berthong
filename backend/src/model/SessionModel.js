import mongoose from 'mongoose';

const Schema = mongoose.Schema

const sessionSchema = new Schema({
  userId: { type: String },
  token: { type: String },
  deviceAgent: { type: String },
  expired: { type : Date, default: +new Date() + 30*24*60*60*1000 } // 30 จำนวนวันที่ จะ expired
},
{
    timestamps: true
})

const Session = mongoose.model('session', sessionSchema,'session')
export default Session