import mongoose from 'mongoose';

const Schema = mongoose.Schema

const bankSchema = new Schema({
  name: { type: String },
  description: { type: String },
  isPublish: { type: Number}
},
{
    timestamps: true
})

const Bank = mongoose.model('bank', bankSchema,'bank')
export default Bank