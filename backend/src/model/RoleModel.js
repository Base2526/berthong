import mongoose from 'mongoose';

const Schema = mongoose.Schema

const roleSchema = new Schema({
  name: { type: String },
  description: { type: String },
  isPublish: { type: Number}
},
{
    timestamps: true
})

const Role = mongoose.model('role', roleSchema,'role')
export default Role