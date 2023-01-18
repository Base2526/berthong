import mongoose from 'mongoose';

const Schema = mongoose.Schema

const roomSchema = new Schema({
  name: { type: String, index:true, unique:true,sparse:true },
  summary: { type: String },
  description: { type: String },
  room_type: { type: String },
  maximum_nights: { type: Number },
  minimum_nights: { type: Number },
  beds: { type: Number },
  accommodates: { type: Number },
  price: { type: Number },
  cleaning_fee: { type: Number }
},
{
    timestamps: true
})

const Room = mongoose.model('room', roomSchema,'room')
export default Room