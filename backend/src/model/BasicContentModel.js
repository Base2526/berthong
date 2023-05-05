import mongoose from 'mongoose';

const Schema = mongoose.Schema

const basicContentSchema = new Schema({
  name: { type: String },
  description: { type: String },
},
{
    timestamps: true
})

const BasicContent = mongoose.model('basicContent', basicContentSchema,'basicContent')
export default BasicContent