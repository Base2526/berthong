import mongoose from 'mongoose';

const Schema = mongoose.Schema

const bankSchema = new Schema({
  name: { type: String, required:[true, "Name is a required field"] },
  description: { type: String }
},
{
    timestamps: true
})

const Bank = mongoose.model('bank', bankSchema,'bank')
export default Bank