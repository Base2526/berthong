import mongoose from 'mongoose';
const Schema = mongoose.Schema

// ManageLottery
const ManageLotterySchema = new Schema({
    title: { type: String, required:[true, "Title is a required field"] }, 
    start_date_time: { type: Date, required:[true, "Start date-time is a required field"] },
    end_date_time: { type: Date, required:[true, "Start date-time is a required field"] },
    bon: { type: String }, 
    lang: { type: String },
    description: { type: String },
    enable:{
        type: Number,
        enum : [0, 1], // 0: 'FALSE', 1: 'TURE'
        default: 1
    }, 
},
{
    timestamps: true
})

const ManageLottery = mongoose.model('manageLottery', ManageLotterySchema,'manageLottery')
export default ManageLottery