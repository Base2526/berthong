import mongoose from 'mongoose';

const Schema = mongoose.Schema

const userSchema = new Schema({
  username: { type: String },
  password: { type: String },
  email: { type: String },
  displayName: { type: String },

  /*
  '' : anonymous,
  '62a2ccfbcf7946010d3c74a6' : authenticated, 
  '62a2ccfbcf7946010d3c74a2' : administrator
  */
  roles: [{ type: String,
            enum : ['62a2ccfbcf7946010d3c74a6', '62a2ccfbcf7946010d3c74a2'],
            default: '62a2ccfbcf7946010d3c74a6' }],
  isActive: { type: String },
  image :[{
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    encoding: { type: String },
  }],
  lastAccess : { type : Date, default: Date.now },
  isOnline: {type: Boolean, default: false},
  socialType:{
    type: String,
    enum : ['website','facebook', 'google', 'github'],
    default: 'website'
  }, 
  socialId: { type: String },
  socialObject: { type: String },
},
{
    timestamps: true
})


const User = mongoose.model('user', userSchema,'user')
export default User