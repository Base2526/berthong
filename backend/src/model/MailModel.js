import mongoose from 'mongoose';

const Schema = mongoose.Schema

const mailSchema = new Schema({
  name: { type: String },
  description: { type: String },
  isPublish: { type: Number}
},
{
    timestamps: true
})

const Mail = mongoose.model('mail', mailSchema,'mail')
export default Mail