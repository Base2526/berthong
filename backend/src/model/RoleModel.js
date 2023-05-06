import mongoose from 'mongoose';

const Schema = mongoose.Schema

const roleSchema = new Schema({
  name: { type: String, required:[true, "Name is a required field"]},
  description: { type: String }
},
{
    timestamps: true
})

const Role = mongoose.model('role', roleSchema,'role')
export default Role