import mongoose from 'mongoose';
const Schema = mongoose.Schema

var File = new Schema({
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
})

const ContactUsSchema = new Schema({
    title: { type: String, required:[true, "Title is a required field"] },
    description: { type: String, required:[true, "Description is a required field"] },
    files: [File],
},
{
    timestamps: true
})

const ContactUs = mongoose.model('contactUs', ContactUsSchema,'contactUs')
export default ContactUs