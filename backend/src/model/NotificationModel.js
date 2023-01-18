import mongoose from 'mongoose';

const Schema = mongoose.Schema

const notificationSchema = new Schema({
    user_to_notify: { type: String },  // คนทีรับ notify
    user_who_fired_event: { type: String },  // คนที่ส่ง notify
    type: { type: String },
    text: { type: String },
    status: { type: String },

    input: { type: Object }
},
{
    timestamps: true
})

const Notification = mongoose.model('notification', notificationSchema,'notification')
export default Notification