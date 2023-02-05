import mongoose from 'mongoose';

const Schema = mongoose.Schema

var File = new Schema({
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
})

var BuyInput = new Schema({
    userId: { type: String, required:[true, "User-ID is a required field"]},
    itemId: Number,
    selected:{
        type: Number,
        enum : [0, 1], // 0: 'book', 1: 'buy'
        default: 0
    }, 
    createdAt : { type : Date, default: Date.now },
    updatedAt : { type : Date, default: Date.now },
})

const FollowInput = new Schema({
    userId: { type: Schema.Types.ObjectId, required:[true, "User-ID is a required field"]},
    createdAt : { type : Date, default: Date.now },
    updatedAt : { type : Date, default: Date.now },
})

const SupplierSchema = new Schema({
    title: { type: String, required:[true, "Title is a required field"] },
    price: { type: Number, required:[true, "Price is a required field"] },
    priceUnit: { type: Number, required:[true, "Price-Unit is a required field"] },
    description: { type: String },
    dateLottery: { type: Date, required:[true, "Date-Lottery is a required field"] },
    files: [File],
    buys: [BuyInput],
    publish: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, required:[true, "OwnerId is a required field"] },
    follows: [FollowInput]
},
{
    timestamps: true
})

const Supplier = mongoose.model('supplier', SupplierSchema,'supplier')
export default Supplier