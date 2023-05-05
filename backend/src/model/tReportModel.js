import mongoose from 'mongoose';
const Schema = mongoose.Schema
const tReportSchema = new Schema({
  name: { type: String },
  description: { type: String },
  isPublish: { type: Number}
},
{
    timestamps: true
})

const tReport = mongoose.model('tReport', tReportSchema, 'tReport')
export default tReport