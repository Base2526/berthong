import mongoose from 'mongoose';
const Schema = mongoose.Schema

const DateLotterySchema = new Schema({
    title: { type: String, required:[true, "Title is a required field"] },
    startDate: { type: Date, required:[true, "Start date is a required field"] },
    endDate: { type: Date, required:[true, "End date is a required field"] },
    description: { type: String },
    weight: { type: Number, required:[true, "Weight is a required field"] },
},
{
    timestamps: true
})

const DateLottery = mongoose.model('dateLottery', DateLotterySchema,'dateLottery')
export default DateLottery