import mongoose from 'mongoose';
const Schema = mongoose.Schema

const notificationSchema = new Schema({
    user_to_notify: { type: Schema.Types.ObjectId, required:[true, "user_to_notify is a required field"] },  // คนทีรับ notify
    type:  {
                type: String,
                enum : ['withdraw','deposit', 'system'],
                default: 'system'
            },
    data:  { type: Object },
    status:  {
                type: String,
                enum : ['unread','read'],
                default: 'unread'
            }
}, {timestamps: true})

const Notification = mongoose.model('notification', notificationSchema,'notification')
export default Notification