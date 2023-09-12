import mongoose from 'mongoose';
const Schema = mongoose.Schema

import * as Constants from "../constants"

const notificationSchema = new Schema({
    user_to_notify: { type: Schema.Types.ObjectId, required:[true, "user_to_notify is a required field"] },  // คนทีรับ notify
    type:  {
                type: Number,
                enum : [0, 1, 2, 3], // 0: 'withdraw', 1: 'deposit', 2: 'system', 3: 'info'
                default: 2
            },
    user_id_approve: { type: Schema.Types.ObjectId, required:[true, "user_id_approve is a required field"] },
    data:  { type: Object },
    message:  { type: String },
    status: {
                type: Number,
                enum : [0, Constants.REJECT, Constants.APPROVED], // 0: 'REJECT', 1: 'APPROVED'
                default: 0
            },
    flag: {
                type: Number,
                enum : [0, 1], // 0: 'unread', 1: 'read'
                default: 0
            },
    delete: {
                type: Number,
                enum : [0, 1], // 0: 'FALSE', 1: 'TRUE'
                default: 0
            },
}, {timestamps: true})

const Notification = mongoose.model('notification', notificationSchema,'notification')
export default Notification