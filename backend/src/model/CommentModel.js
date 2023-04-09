import mongoose from 'mongoose';
const Schema = mongoose.Schema

const commentSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required:[true, "Id is a required field"] },
    // supplierId: { type: Schema.Types.ObjectId, required:[true, "Supplier-Id is a required field"] },
    data: [{
            userId: { type: Schema.Types.ObjectId, required:[true, "User-Id is a required field"] },
            comId: { type: String },
            created: { type: Date },
            updated: { type: Date },
            text: { type: String },
            replies: [{
                        userId: { type: Schema.Types.ObjectId, required:[true, "User-Id is a required field"] },
                        comId: { type: String },
                        text: { type: String },
                        created: { type: Date },
                        updated: { type: Date },
                    }]
            }]
},
{
    timestamps: true
})

/*
 {
    "userId": "01a",
    "comId": "012",
    "fullName": "Riya Negi",
    "avatarUrl": "https://ui-avatars.com/api/name=Riya&background=random",
    "text": "Hey, Loved your blog! ",
    "replies": [
      {
        "userId": "02a",
        "comId": "013",
        "fullName": "Adam Scott",
        "avatarUrl": "https://ui-avatars.com/api/name=Adam&background=random",
        "text": "Thanks! It took me 1 month to finish this project but I am glad it helped out someone!🥰"
      },
      {
        "userId": "01a",
        "comId": "014",
        "fullName": "Riya Negi",
        "avatarUrl": "https://ui-avatars.com/api/name=Riya&background=random",
        "text": "thanks!😊"
      }
    ]
  },
*/

const Comment = mongoose.model('comment', commentSchema,'comment')
export default Comment