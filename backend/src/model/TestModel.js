import mongoose from 'mongoose';

const Schema = mongoose.Schema

const testSchema = new Schema({
  message: { type: Number, required:[true, "Message is a required field"] }
},
{
    timestamps: true
})

const Test = mongoose.model('test', testSchema,'test')
export default Test