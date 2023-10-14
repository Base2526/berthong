import mongoose from 'mongoose';

const Schema = mongoose.Schema

const dblogSchema = new Schema({
  level: { type: String },
  meta: { type: Object },
  message: { type: Object },
  timestamp: { type : Date, default: Date.now }
},
{
    timestamps: true
})

const Dblog = mongoose.model('dblog', dblogSchema,'dblog')
export default Dblog