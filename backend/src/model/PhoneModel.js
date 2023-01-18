import mongoose from 'mongoose';

const Schema = mongoose.Schema

const phoneSchema = new Schema({
    phones: [String],
    description: { type: String },
    ownerId: {type: String}
},
{
    timestamps: true
})

const Phone = mongoose.model('phone', phoneSchema,'phone')
export default Phone