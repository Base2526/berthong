import mongoose from 'mongoose';

const Schema = mongoose.Schema

var File = new Schema({
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
})

var BuyInput = new Schema({
    userId: { type: Schema.Types.ObjectId, required:[true, "User-ID is a required field"]},
    transitionId: { type: Schema.Types.ObjectId, required:[true, "Transition-ID is a required field"]},
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
    consolation: { type: String }, // รางวัลปลอบใจ
    // dateLottery: { type: Schema.Types.ObjectId, required:[true, "Date-Lottery is a required field"] },
    manageLottery: { type: Schema.Types.ObjectId, required:[true, "Date-Lottery is a required field"] },
    files: [File],
    condition: { type: Number, required:[true, "Condition is a required field"] },  // 11-100
    category:{
        type: Number,
        enum : [0, 1, 2, 3], // 0: money, 1: gold, 2 : things, 3 : etc
        default: 0
    },   
    type:{
        type: Number,
        enum : [0, 1, 2], // 0: bon, 1: lang, 2: couple
        default: 0
    },         
    kind:{
        type: Number,
        enum : [0, 1, 2], // 0: thai, 1: laos, 2: vietnam
        default: 0
    },
    number_lotter:{
        type: Number,
        enum : [0, 1], // 0: 100, 1: 1000
        default: 0
    },
    buys: [BuyInput],
    publish: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, required:[true, "OwnerId is a required field"] },
    follows: [FollowInput],
    expire: { type: Boolean, default: false },
    test: { type: Boolean, default: false },
},
{
    timestamps: true
})

const Supplier = mongoose.model('supplier', SupplierSchema,'supplier')
export default Supplier