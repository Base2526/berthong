import mongoose from 'mongoose';

const Schema = mongoose.Schema

const basicContentSchema = new Schema({
  // name: { type: String },
  title: { type: String, required:[true, "Title is a required field"] },
  description: { type: String },
},
{
    timestamps: true
})

const BasicContent = mongoose.model('basicContent', basicContentSchema,'basicContent')
export default BasicContent