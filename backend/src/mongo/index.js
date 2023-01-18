import mongoose from "mongoose";
import {Bank, 
        Post, 
        Role, 
        User, 
        Socket, 
        Comment, 
        Mail, 
        Bookmark, 
        Report,
        tReport,
        Share,
        Dblog,
        Conversation,
        Message,
        Follow,
        Session,
        Notification,
        Phone,
        BasicContent} from '../model'

let logger = require("../utils/logger");

const modelExists =()=>{
  Bank.find({}, async(err, result) => {
    if (result.length > 0) {
      // console.log('Found Bank');
    } else {
      // console.log('Not found Bank, creating');
      let newSettings = new Bank({});
      await newSettings.save();

      await Bank.deleteMany({})
    }
  });

  Post.find({}, async(err, result) => {
    if (result.length > 0) {
      // console.log('Found Post');
    } else {
      // console.log('Not found Post, creating');
      let newSettings = new Post({});
      await newSettings.save();

      await Post.deleteMany({})
    }
  });

  Role.find({},async(err, result) =>{
    if (result.length > 0) {
      // console.log('Found Role');
    } else {
      // console.log('Not found Role, creating');
      let newSettings = new Role({});
      newSettings.save();

      await Role.deleteMany({})
    }
  });

  Socket.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Socket');
    } else {
      // console.log('Not found Socket, creating');
      let newSettings = new Socket({});
      await newSettings.save();

      await Socket.deleteMany({})
    }
  });

  User.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found User');
    } else {
      // console.log('Not found User, creating');
      let newSettings = new User({});
      await newSettings.save();

      await User.deleteMany({})
    }
  });

  Comment.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Comment');
    } else {
      // console.log('Not found Comment, creating');
      let newComments = new Comment({});
      await newComments.save();

      await Comment.deleteMany({})
    }
  });

  Mail.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Mail');
    } else {
      // console.log('Not found Mail, creating');
      let newMails = new Mail({});
      await newMails.save();

      await Mail.deleteMany({})
    }
  });

  Bookmark.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Bookmark');
    } else {
      // console.log('Not found Bookmark, creating');
      let newBookmarks = new Bookmark({});
      await newBookmarks.save();

      await Bookmark.deleteMany({})
    }
  });

  Report.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Report');
    } else {
      // console.log('Not found Report, creating');
      let newReport = new Report({});
      await newReport.save();

      await Report.deleteMany({})
    }
  });

  tReport.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found tReport');
    } else {
      // console.log('Not found tReport, creating');
      let newTReport = new tReport({});
      await newTReport.save();

      await tReport.deleteMany({})
    }
  });

  Share.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Share');
    } else {
      // console.log('Not found Share, creating');
      let newShare = new Share({});
      await newShare.save();

      await Share.deleteMany({})
    }
  });

  Dblog.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Dblog');
    } else {
      // console.log('Not found Dblog, creating');
      let newDblog = new Dblog({});
      await newDblog.save();

      await Dblog.deleteMany({})
    }
  });

  Conversation.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Conversation');
    } else {
      // console.log('Not found Conversation, creating');
      let newConversation = new Conversation({});
      await newConversation.save();

      await Conversation.deleteMany({})
    }
  });

  Message.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Message');
    } else {
      // console.log('Not found Message, creating');
      let newMessage = new Message({_id: mongoose.Types.ObjectId()});
      await newMessage.save();

      await Message.deleteMany({})
    }
  });

  Follow.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Follow');
    } else {
      // console.log('Not found Follow, creating');
      let newFollow = new Follow({});
      await newFollow.save();

      await Follow.deleteMany({})
    }
  });

  Session.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Session');
    } else {
      // console.log('Not found Session, creating');
      let newSession = new Session({});
      await newSession.save();

      await Session.deleteMany({})
    }
  });

  Notification.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Notification');
    } else {
      // console.log('Not found Notification, creating');
      let newNotification = new Notification({});
      await newNotification.save();

      await Notification.deleteMany({})
    }
  });

  Phone.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found Phone');
    } else {
      // console.log('Not found Phone, creating');
      let newPhone = new Phone({});
      await newPhone.save();

      await Phone.deleteMany({})
    }
  });

  BasicContent.find({}, async(err, result)=> {
    if (result.length > 0) {
      // console.log('Found BasicContent');
    } else {
      // console.log('Not found BasicContent, creating');
      let newBasicContent = new BasicContent({});
      await newBasicContent.save();

      await BasicContent.deleteMany({})
    }
  });

}

// TODO: initial and connect to MongoDB
mongoose.Promise = global.Promise;
// mongoose.connect("YOUR_MONGODB_URI", { useNewUrlParser: true });

// console.log("process.env.MONGO_URI :", process.env)
// uri
mongoose.connect(
  // "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/bl?replicaSet=rs",
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useFindAndModify: false, // optional
    useCreateIndex: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 100000, // Defaults to 30000 (30 seconds)
  }
);

const connection = mongoose.connection;
connection.on("error", (err)=>{
  console.error.bind(console, "Error : Connection to database")

  logger.error("Error : Connection to database :", err.toString() )
});
connection.once("open", async function () {
  // we're connected!
  console.log("Successfully : Connected to database!");

  logger.info("Successfully : Connected to database!")

  modelExists()
});

export default connection;