import { withFilter } from 'graphql-subscriptions';
import _ from "lodash";
import FormData from "form-data";
import cryptojs from "crypto-js";
import deepdash from "deepdash";
deepdash(_);
import * as fs from "fs";

import {Bank, 
        Post, 
        Role, 
        User, 
        Comment, 
        Mail, 
        Socket, 
        Bookmark, 
        Report, 
        tReport, 
        Share, 
        Dblog,
        Conversation,
        Message,
        BasicContent,
        Follow,
        Session,
        Notification,
        Phone} from './model'
import {emailValidate} from './utils'
import pubsub from './pubsub'

import {fileRenamer, checkAuthorization} from "./utils"
import { __TypeKind } from 'graphql';
const path = require('path');
const fetch = require("node-fetch");

// const GraphQLUpload = require('graphql-upload/GraphQLUpload.js');
const {
  GraphQLUpload,
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require('graphql-upload');

let logger = require("./utils/logger");

import {getSessionId} from "./utils"

export default {
  Query: {
    // ping
    async ping(parent, args, context, info){
      try{
        // let { status, code, currentUser } = context 
        // console.log("ping :", currentUser?._id)

        let { req } = context

        ///////////////////////////
        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization
        //////////////////////////

        if(status && code == 1){
          console.log("ping ok : ", current_user?._id)
        }else{
          console.log("ping other")
        }

        return { status:true }
      } catch(err) {
        logger.error(err.toString());
        console.log("homes err :", args, err.toString())
        return;
      }
    },
    // profile 
    async profile(parent, args, context, info) {
      let start = Date.now()

      ///////////////////////////
      let { req } = context

      let authorization = await checkAuthorization(req);
      let { status, code, current_user } =  authorization
      //////////////////////////

      
      //////////////////////////

      let data = await User.findById(current_user?._id);

      console.log("profile :",  current_user?._id, data)
      return {
        status:true,
        messages: "", 
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // user
    async user(parent, args, context, info) {
      let start = Date.now()

      try{
        if(!context.status){
          // foce logout
        }

        let {_id} = args

        if(_.isEmpty(_id)){
          return;
        }

        let data = await User.findById(_id);
        return {
          status:true,
          messages: "", 
          data,
          executionTime: `Time to execute = ${
            (Date.now() - start) / 1000
          } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        
        return {
          status: false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },
    async users(parent, args, context, info) {
      let start = Date.now()
      try{
        
        let {page, perPage} = args
        let data = await  User.find({}).limit(perPage).skip(page); 
        let total = (await User.find({})).length;

        return {
          status:true,
          data,
          total,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }

      } catch(err) {
        logger.error(err.toString());

        return {
          status: false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },
    async getManyUsers(root, {
      _ids
    }) {
      console.log("getManyUsers :", _ids)

      let start = Date.now()

      let data =  await User.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // user

    // homes
    async homes(parent, args, context, info) {
      let start = Date.now()
      try{
        let { req } = context

        ///////////////////////////
        // let authorization = await checkAuthorization(req);
        // console.log("homes : authorization :", authorization)
        //////////////////////////


        let { page, perPage, keywordSearch, category } = args
        

        /*
        0 : ชื่อเรื่อง | title
        1 : ชื่อ-นามสกุล บัญชีผู้รับเงินโอน | nameSubname
        2 : เลขบัตรประชาชนคนขาย | idCard
        3 : บัญชีธนาคาร | banks[]
        4 : เบอร์โทรศัพท์ | tels[]
        */

        let data = null;
        let total = 0;

        page    = parseInt(page)
        perPage = parseInt(perPage)

        let skip =  page == 0 ? page : (perPage * page) + 1;
      
        // console.log("keywordSearch ::", !!keywordSearch, keywordSearch)
        if(!!keywordSearch){
          keywordSearch = keywordSearch.trim()
          
          category = category.split(',');

          let regex = [];
          if(category.includes("0")){
            regex = [...regex, {title: { $regex: '.*' + keywordSearch + '.*', $options: 'i' } }]
          }

          if(category.includes("1")){
            regex = [...regex, {nameSubname: { $regex: '.*' + keywordSearch + '.*', $options: 'i' } }]
          }

          if(category.includes("2")){
            regex = [...regex, {idCard: { $regex: '.*' + keywordSearch + '.*', $options: 'i' } }]
          }

          if(category.includes("3")){
            regex = [...regex, {"banks.bankAccountName": { $in: [keywordSearch] } }]
          }

          if(category.includes("4")){
            regex = [...regex, {tels: { $in: [keywordSearch] } }]
          }
          
          data = await Post.find({ $or: regex }).limit(perPage).skip(skip);

          console.log("regex :", data, regex)


          total = (await Post.find({ $or: regex }).lean().exec()).length; 
        }else{
          data = await Post.find().limit(perPage).skip(skip); 

          total = (await Post.find().lean().exec()).length;
        }
        // console.log("homes total , skip :", total, skip, context.currentUser)

        let new_data = await Promise.all( _.map(data, async(v)=>{
                          return {...v._doc, shares: await Share.find({postId: v._id})}
                        }))

        return {
          status:true,
          data: new_data,
          total,
          executionTime: `Time to execute = ${
            (Date.now() - start) / 1000
          }`,
        }
      } catch(err) {
        logger.error(err.toString());
        console.log("homes err :", args, err.toString())

        return {
          status: false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 }`,
        }
      }
    },
    // homes

    // post
    async post(parent, args, context, info) {
      try{
        console.log("post, args :", args)

        let start = Date.now()
        let { _id } = args
        let data = await Post.findById(_id);
        return {
          status:true,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`,
          data
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async posts(parent, args, context, info) {
      let start = Date.now()
      try{
        let { req } = context

        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization

        console.log("posts, args :", args, " > ", current_user?._id)

        let data = [];
        if(!_.isEmpty(current_user?._id)){
          let { page, perPage } = args
          data = await  Post.find({ownerId: current_user?._id}).limit(perPage).skip(page); 
          let total = (await Post.find({ownerId: current_user?._id}).lean().exec()).length;
          return {
            status:true,
            data,
            total,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        return {
          status:true,
          data,
          total: 0,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        console.log("posts err :", args, err.toString())
        
        return {
          status:false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },
    async postsByUser(root, {
      userId
    }) {

      let start = Date.now()

      // console.log("postsByUser : ", userId)
      
      let data = await  Post.find({ownerId: userId}); 
      return {
        status:true,
        data,
        total: data.length,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyPosts(root, {
      _ids
    }) {
      console.log("getManyPosts :", _ids)

      let start = Date.now()
      let data =  await Post.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // post

    // Role
    async role(parent, args, context, info) {

      try{
        let start = Date.now()

        let {_id} = args
        let data = await Role.findById(_id);
        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }

      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async roles(parent, args, context, info) {

      try{
        let start = Date.now()
        let data = await Role.find();
        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async getManyRoles(root, {
      _ids
    }) {
      console.log("getManyRoles :", _ids)

      let start = Date.now()
      let data =  await Role.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Role

    // Bank
    async bank(parent, args, context, info) {
      try{
        let start = Date.now()
        let { _id } = args
        let data = await Bank.findById(_id);
        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async banks(parent, args, context, info) {
      try{
        let start = Date.now()
        let data = await Bank.find();

        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async getManyBanks(root, {
      _ids
    }) {
      console.log("getManyBanks :", _ids)

      let start = Date.now()


      let data =  await Bank.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Bank

    // BasicContent
    async basicContent(parent, args, context, info) {
      try{
        let start = Date.now()

        let { _id } = args
        let data = await BasicContent.findById(_id);

        return { 
          status:true, 
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async basicContents(parent, args, context, info) {
      try{
        let start = Date.now()
        let data = await BasicContent.find();
        
        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    // BasicContent

    // Mail
    async Mail(root, {
      _id
    }) {

      let data = await Mail.findById(_id);
      return {
        status:true,
        data
      }
    },
    async Mails(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      console.log("Mails: page : ", page,
                  ", perPage : ", perPage,
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await Mail.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyMails(root, {
      _ids
    }) {
      console.log("getManyMails :", _ids)

      let start = Date.now()


      let data =  await Mail.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Mail

    // Socket
    async socket(parent, args, context, info) {

      try{
        let start = Date.now()

        let {_id} = args

        let data = await Socket.findById(_id);
        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
      
    },
    async sockets(parent, args, context, info) {
      try{
        let start = Date.now()
        let data = await Socket.find();

        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async getManySockets(parent, args, context, info) {
      try{
        let {_ids} = args

        let start = Date.now()
        let data =  await Socket.find({_id: { $in: _ids }})

        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    // Socket

    // Comment 
    async comment(parent, args, context, info) {
      let start = Date.now()

      try{
        let { req } = context

        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization


        let { postId } = args
        // console.log("Comment: ", postId)

        let data = await Comment.findOne({postId: postId});

        // console.log("Comment > data : ", data)
        
        return {
          status:true,
          data: _.isEmpty(data) ? [] : data.data,
          executionTime: `Time to execute = ${
            (Date.now() - start) / 1000
          } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return {
          status:false,
          message: err.toString(),
          executionTime: `Time to execute = ${
            (Date.now() - start) / 1000
          } seconds`
        }
      }
    },

    async getManyReferenceComment(root, {
      postId,
      page,
      perPage, 
      sortField,
      sortOrder, 
      filter
    }) {

      let start = Date.now()

      console.log("Comments: page : ", page,
                  ", perPage : ", perPage, 
                  ", sortField : ", sortField,
                  ", sortOrder : ", sortOrder, 
                  ", filter : ", JSON.parse(JSON.stringify(filter)),
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      // let data = await Comment.find();

      // let data = await User.find();
      let data = await  Comment.find({postId}).limit(perPage).skip(page).sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 });

      let total = (await Comment.find({postId}).sort({[sortField]: sortOrder === 'ASC' ? 1 : -1 })).length;
      console.log("total  ", total)

      return {
        status:true,
        data,
        total,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    // Comment

    async bookmarks(parent, args, context, info) {
      let start = Date.now()
      try{

        // console.log("bookmarks : ", args)

        let { page, perPage } = args
        let { req } = context

        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization

        let data = await Bookmark.find({userId: current_user?._id.toString(), status: true});
        return {
          status:true,
          data,
          executionTime: `Time to execute = ${
            (Date.now() - start) / 1000
          } seconds`
        }

      } catch(err) {
        logger.error(err.toString());
        return {
          status:false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },

    async bookmarksByPostId(root, {
      postId
    }) {
      let start = Date.now()
      let data  = await Bookmark.find({ postId });
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async isBookmark(parent, args, context, info) {
      try{
        let start = Date.now()
        let { postId } = args
        let { status, code, currentUser } = context 

        if(!_.isEmpty(currentUser)){
          console.log("ping :", currentUser?._id)
    
          return {
            status:true,
            data: await Bookmark.findOne({ userId: currentUser?._id, postId }),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }else{
          return {
            status:false,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }
      } catch(err) {
        logger.error(err.toString());
        console.log("isBookmark err :", args, err.toString())
        return;
      }
    },

    // 
    async bookmarksByUserId(parent, args, context, info) {
      let start = Date.now()
      let { userId } = args

      let data  = await Bookmark.find({ userId, status:true });
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    // isFollow(userId: ID!, friendId: ID!): FollowPayLoad
    async isFollow(root, {
      userId,
      friendId
    }) {
      let start = Date.now()
      let data =await Follow.findOne({ userId, friendId });

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async follower(root, {
      userId
    }) {

      let start = Date.now()
      let follows =await Follow.find({ friendId: userId, status: true  });

      let data =  await Promise.all(_.map(follows, async(v)=>{ return await User.findById(v.userId) }))

      return {
        status:true,
        data: data,
        total: data.length,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async followingByUserId(root, {
      userId
    }) {
      console.log("followingByUserId : ", userId)
      let start = Date.now()
      let data =await Follow.find({ userId: userId, status: true  });

      console.log("followingByUserId data : ", data)
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },


    // 
    async ReportList(root, {
      page,
      perPage
    }) {
      let start = Date.now()
      let data = await Report.find();
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    /////
    async TReport(root, {
      _id
    }) {

      let data = await tReport.findById(_id);
      return {
        status:true,
        data
      }
    },
    async TReportList(root, {
      page,
      perPage
    }) {

      let start = Date.now()

      console.log("TReportList: page : ", page,
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await tReport.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    async getManyTReportList(root, {
      _ids
    }) {
      console.log("getManyTReportList :", _ids)

      let start = Date.now()

      let data =  await tReport.find({_id: {
        $in: _ids,
      }})

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },
    /////


    /////
    async shares(root, {
      page,
      perPage
    }) {

      let start = Date.now()
      console.log("Shares: page : ", page,
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )

      let data = await Share.find();

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async shareByPostId(parent, args, context, info) {

      let start = Date.now()

      let { postId } = args
      // console.log("ShareByPostId  postId: ", postId,
      //             ", page : ", page, 
      //             ", perPage : ", perPage, 
      //             `Time to execute = ${
      //               (Date.now() - start) / 1000
      //             } seconds` )

      let data = await Share.find({postId: postId});
      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async Dblog(root, {
      page,
      perPage
    }) {

      let start = Date.now()
      console.log("Dblog  : ", page, 
                  ", perPage : ", perPage, 
                  `Time to execute = ${
                    (Date.now() - start) / 1000
                  } seconds` )
            
      let skip =  page == 0 ? page : (perPage * page) + 1;
      let data = await Dblog.find({}).limit(perPage).skip(skip);

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    // 
    async conversations(parent, args, context, info) {
      let start = Date.now()
      try{
        let { req } = context

        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization

        console.log("conversations #0 : ", authorization)

        if( status && code == 1 ){
          let data=  await Conversation.find({
            "members.userId": { $all: [ current_user?._id.toString() ] }
          });

          console.log("conversations #1 : ", data)
          return {
            status:true,
            data,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }
        console.log("conversations #2")
        return {
          status:false,
          data: [],
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        
        return {
          status:false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },

    async notifications(parent, args, context, info) {
      try{
        let start = Date.now()
        let { status, code, currentUser } = context 

        if(!_.isEmpty(currentUser) ){

          return {
            status: true,
            data: await Notification.find({ user_to_notify: currentUser?._id }),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        return {
          status:true,
          data:[],
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },

    async fetchMessage(parent, args, context, info) {
      let start = Date.now()

      // let { currentUser } = context

      // if(_.isEmpty(currentUser) ){
      //   return;
      // }

      let { conversationId } = args

      if(_.isEmpty(conversationId)){
        return ;
      }

      let data = await Message.find({ conversationId });

      // let newData = data.map(({ _id: id, ...rest }) => ({
      //   id,
      //   ...rest,
      // }));

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${
          (Date.now() - start) / 1000
        } seconds`
      }
    },

    async phones(parent, args, context, info) {
      let start = Date.now() 
      try{
               
        let { page, perPage } = args
        let { req } = context

        ///////////////////////////
        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization
        //////////////////////////

        console.log("phones :", authorization,  current_user?._id)

        let roles = (await User.findById(current_user?._id)).roles

        let data = await  Phone.find({ownerId: current_user?._id}).limit(perPage).skip(page); 
        let total = (await Phone.find({ownerId: current_user?._id}).lean().exec()).length;

        //  62a2ccfbcf7946010d3c74a2 :: administrator
        //  62a2ccfbcf7946010d3c74a6 :: authenticated

        // administrator
        if(roles.includes('62a2ccfbcf7946010d3c74a2')){
          data = await  Phone.find().limit(perPage).skip(page); 
          total = (await Phone.find().lean().exec()).length;
        }

        return {
          status:true,
          data,
          total,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());

        return {
          status:false,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },
    async phone(parent, args, context, info) {
      let start = Date.now()
      try{
        let {_id} = args

        let data = await Phone.findById(_id);
        return {
          status:true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return {
          status:false,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },
  },
  Upload: GraphQLUpload,
  Mutation: {

    async currentNumber(parent, args, context, info) {
      let currentNumber = Math.floor(Math.random() * 1000);

      pubsub.publish("NUMBER_INCREMENTED", { numberIncrementedx: currentNumber });
      return currentNumber;
    },

    // Login & Logout
    async login(parent, args, context, info) {
      let start = Date.now()
      try{
        let {input} = args

        console.log("login : ", input)

        let user = emailValidate().test(input.username) ?  await User.findOne({email: input.username}) : await User.findOne({username: input.username})

        if(user === null){
          return {
            status: false,
            messages: "xxx", 
            data:{
              _id: "",
              username: "",
              password: "",
              email: "",
              displayName: "",
              roles:[]
            },
            executionTime: `Time to execute = ${
              (Date.now() - start) / 1000
            } seconds`
          }
        }

        // update lastAccess
        await User.findOneAndUpdate({
          _id: user._doc._id
        }, {
          lastAccess : Date.now()
        }, {
          new: true
        })

        // let roles = await Promise.all(_.map(user.roles, async(_id)=>{
        //   let role = await Role.findById(_id)
        //   return role.name
        // }))

        // console.log("Login #1: ", user.roles )

        // user = { ...user._doc,  roles }
        // console.log("Login #2: ", user )

        // let token = jwt.sign(user._id.toString(), process.env.JWT_SECRET)
        // input = {...input, token}
        // let session = await Session.findOne({deviceAgent: input.deviceAgent})
        // if(_.isEmpty(session)){
        //   session = await Session.create(input);
        // }

        let sessionId = await getSessionId(user._id.toString(), input)
        
        return {
          status: true,
          data: user,
          sessionId,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }

      } catch(err) {
        logger.error(err.toString());
        return {
          status: false,
          messages: err.toString(), 
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },

    // loginWithSocial
    async loginWithSocial(parent, args, context, info) {
      let {input} = args
      console.log("loginWithSocial :", input)

      let start = Date.now()
      switch(input.authType.toLowerCase()){
        case "google":{

          /*
            --------  response  --------
            accessToken
            googleId
            profileObj {
              email : "android.somkid@gmail.com"
              familyName : "Simajarn"
              givenName : "Somkid"
              googleId : "112378752153101585347"
              imageUrl : "https://lh3.googleusercontent.com/a-/AFdZucrsz6tfMhKB87pCWcdwoMikQwlPG8_aa4h6zYz1ng=s96-c"
              name : "Somkid Simajarn"
            }
            tokenId
            tokenObj {
              access_token : "ya29.a0AVA9y1uPAzoEGM3joZMmfeWhu_i10ANwgeFmvtcLi8AS1o-TytHHCyrqi4-BSCA6g6hbGX4SVIdLzSuGSsMyFT3tL4_RO99je5YfVqpoji0YIDrnuzVvdKK6_uPaMUmW467bYBR75iCBwaGGUQ2ba8P5IC4MaCgYKATASARISFQE65dr8q10VA-k-brPrO1Y-jVwB0Q0163"
              expires_at : 1662901232664
              expires_in : 3599
              first_issued_at : 1662897633664
              id_token : "eyJhbGciOiJSUzI1NiIsImtpZCI6ImNhYWJmNjkwODE5MTYxNmE5MDhhMTM4OTIyMGE5NzViM2MwZmJjYTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTA5NDIwMzg2NTg0My1qcWFqOWFtNHRldnRvY2c3NXRkaXJtdGtoOTVrMjdjYi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjEwOTQyMDM4NjU4NDMtanFhajlhbTR0ZXZ0b2NnNzV0ZGlybXRraDk1azI3Y2IuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIzNzg3NTIxNTMxMDE1ODUzNDciLCJlbWFpbCI6ImFuZHJvaWQuc29ta2lkQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoibjhzSmpBbmVTdWptYlJOdWdvSzItQSIsIm5hbWUiOiJTb21raWQgU2ltYWphcm4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FGZFp1Y3JzejZ0Zk1oS0I4N3BDV2Nkd29NaWtRd2xQRzhfYWE0aDZ6WXoxbmc9czk2LWMiLCJnaXZlbl9uYW1lIjoiU29ta2lkIiwiZmFtaWx5X25hbWUiOiJTaW1hamFybiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjYyODk3NjMzLCJleHAiOjE2NjI5MDEyMzMsImp0aSI6ImQ1NDk0YjY1MDliNmYxOTdjYjZhNGQwYTM3MjZiMWRiM2FiZTIxNTUifQ.CAawd4eccCFomK0NBCeMLUEoUM3I8zUJF6zzQoLC-tgZN6EanSOPRECoVU1zFnX002Su0Nwn1ET96c_xq0SS8Wrir0yFXkBDoi7lIEBNvpbcWxa3Jx79V_K1YgVLvmmRyHD_kx15E6zCpbN6g0ItnwpsheSYFK83y062XeAP1RA3_mas0Sa0ubnjRWF3yvpe6CXYhm5s2dIxJMfLbAZ0HECeRkjKclHHwORKO6ZgmYZU92Pk5_760zMedv-sepNCdPAUAaWx6HE8kb6UW-1jYaSo-zH3KuHIYh9j85xJ8lJNII2EI3tC2VcqHLRShiCDGT9kx--utwScg58dsV9QHQ"
              idpId : "google"
              login_hint : "AJDLj6IwgLvhCVpEzCp3uaFdvrRlobPVw2fzQGnDcVDRIWfEVnCZ5tBvMV9RxH-EeHG6FMgjgi6XG_nZk3EgDid15uEuqyQHKQ"
              scope : "email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid"
              token_type : "Bearer"
            }
 
        
            ----------  newAuthRes ----------
            {
              "token_type": "Bearer",
              "access_token": "ya29.a0AeTM1icjWxWZTlNE7aW4I-NxP3VY4f6QG6b4e1aXeGmcqLzKV0yeDvWXy5XannL_LOu0gqwF-HLeeOxoF5BlU3gRyLk0-w_ttsZIigVmwNFn-FGn_0sXDK4LoUk-Y5YefGRsHilAmAAHz7jMgMb6B80xNw5xD2MaCgYKAa0SARASFQHWtWOmmIZpKcbUdv0btmC2gGUpRw0166",
              "scope": "email profile https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email",
              "login_hint": "AJDLj6IwgLvhCVpEzCp3uaFdvrRlobPVw2fzQGnDcVDRIWfEVnCZ5tBvMV9RxH-EeHG6FMgjgi6XG_nZk3EgDid15uEuqyQHKQ",
              "expires_in": 3599,
              "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcxM2ZkNjhjOTY2ZTI5MzgwOTgxZWRjMDE2NGEyZjZjMDZjNTcwMmEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTA5NDIwMzg2NTg0My1qcWFqOWFtNHRldnRvY2c3NXRkaXJtdGtoOTVrMjdjYi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjEwOTQyMDM4NjU4NDMtanFhajlhbTR0ZXZ0b2NnNzV0ZGlybXRraDk1azI3Y2IuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIzNzg3NTIxNTMxMDE1ODUzNDciLCJlbWFpbCI6ImFuZHJvaWQuc29ta2lkQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiUGFVamZwSVM3d0hFOWV5SlBFcDNWUSIsIm5hbWUiOiJTb21raWQgU2ltYWphcm4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUxtNXd1MzQ0WGlRUkdSOC1yZ2hBX0tyQ1A4djlnbFlRSWE3WFBVSTlSOTk1Zz1zOTYtYyIsImdpdmVuX25hbWUiOiJTb21raWQiLCJmYW1pbHlfbmFtZSI6IlNpbWFqYXJuIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2Njg0NzkwMDQsImV4cCI6MTY2ODQ4MjYwNCwianRpIjoiYzIzYTg2MTIxMTBkNGI1YWIwNmU5MWFhZmEwMGZiYjMxMWY0ZGM2YyJ9.tAOZq5O1pBUHOz5IwtfK5pmk6PP1I5MYmDm0erAjq5PHRC7JUNddlzTiqpN5zprWVBfjdlbMytwbMWwtrSOd_mCdXaK7ffiMYHi91A4tA0_7JvRErAn8-6ZvzjCMl807BcuyuqFvZEHuYkJTGaSV4kmI4d-NDirtWHA2RJQEscLyktkG3t3GxSwF9axoiMzBNPSi_bZ6xKfTLEcgG7t85Wq1DwLGPHmOuIfgdS-q-mMnklPX5x8sCSTNvitsIjK5v_56c0bWrfWzKbiCfkv2UyVWPKRg01CdnRsgnZeUeLaV3mB5-6HKsTsUE3rmA01iJZVw9F-NzuVFwqx9G5z0lQ",
              "session_state": {
                  "extraQueryParams": {
                      "authuser": "0"
                  }
              },
              "first_issued_at": 1668479006076,
              "expires_at": 1668482605076,
              "idpId": "google"
            }
          */
          try{

            let { data } = input

            let user = await User.findOne({socialId: data.profileObj.googleId, socialType: 'google'});
            if(_.isEmpty(user)){

              /*
                email : "android.somkid@gmail.com"
              familyName : "Simajarn"
              givenName : "Somkid"
              googleId : "112378752153101585347"
              imageUrl : "https://lh3.googleusercontent.com/a-/AFdZucrsz6tfMhKB87pCWcdwoMikQwlPG8_aa4h6zYz1ng=s96-c"
              name : "Somkid Simajarn"
              */

              let newInput = {
                username: data.profileObj.email,
                password: cryptojs.AES.encrypt( data.profileObj.googleId, process.env.JWT_SECRET).toString(),
                email: data.profileObj.email,
                displayName: data.profileObj.givenName +" " + data.profileObj.familyName ,
                roles: ['62a2ccfbcf7946010d3c74a4', '62a2ccfbcf7946010d3c74a6'], // anonymous, authenticated
                isActive: 'active',
                image :[{
                  url: data.profileObj.imageUrl,
                  filename: data.profileObj.googleId +".jpeg",
                  mimetype: 'image/jpeg',
                  encoding: '7bit',
                }],
                lastAccess : Date.now(),
                isOnline: true,
                socialType: 'google',
                socialId: data.profileObj.googleId,
                socialObject: JSON.stringify(data)
              }
              user = await User.create(newInput);
            }
            console.log("GOOGLE :", user)

            let sessionId = await getSessionId(user._id.toString(), input)

            return {
              status:true,
              data: user,
              sessionId,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }

          }catch(err){
            logger.error(err.toString());
    
            return {
              status: false,
              message: err.toString(),
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }
        }

        case "github":{
          try{
            let { data } = input

            let user = await User.findOne({socialId: data.code, socialType: 'github'});

            let github_user = null;
            if(_.isEmpty(user)){
              const formData = new FormData();
              formData.append("client_id", process.env.GITHUB_CLIENT_ID);
              formData.append("client_secret", process.env.GITHUB_CLIENT_SECRET);
              formData.append("code", data.code);

              // Request to exchange code for an access token
              github_user = await fetch(process.env.GITHUB_URL_OAUTH_ACCESS_TOKEN, { method: "POST", body: formData })
                                        .then((response) => response.text())
                                        .then((paramsString) => {
                                          let params = new URLSearchParams(paramsString);

                                          console.log("params :", params)

                                          logger.error(JSON.stringify(params));
                                          
                                          let access_token = params.get("access_token");
                                    
                                          // Request to return data of a user that has been authenticated
                                          return fetch(process.env.GITHUB_URL_OAUTH_USER, {
                                            headers: {
                                              Authorization: `token ${access_token}`,
                                            },
                                          });
                                        })
                                        .then((response) => response.json())

              
              /*
              avatar_url : "https://avatars.githubusercontent.com/u/900211?v=4"
              bio :  null
              blog : ""
              company : null
              created_at :  "2011-07-07T10:02:34Z"
              email : "mr.simajarn@gmail.com"
              events_url:  "https://api.github.com/users/Base2526/events{/privacy}"
              followers : 2
              followers_url : "https://api.github.com/users/Base2526/followers"
              following : 11
              following_url : "https://api.github.com/users/Base2526/following{/other_user}"
              gists_url: "https://api.github.com/users/Base2526/gists{/gist_id}"
              gravatar_id : ""
              hireable : null
              html_url : "https://github.com/Base2526"
              id : 900211
              location : null
              login : "Base2526"
              name : "somkid_haha"
              node_id : "MDQ6VXNlcjkwMDIxMQ=="
              organizations_url : "https://api.github.com/users/Base2526/orgs"
              public_gists: 0
              public_repos: 118
              received_events_url: "https://api.github.com/users/Base2526/received_events"
              repos_url : "https://api.github.com/users/Base2526/repos"
              site_admin : false
              starred_url : "https://api.github.com/users/Base2526/starred{/owner}{/repo}"
              subscriptions_url : "https://api.github.com/users/Base2526/subscriptions"
              twitter_username : null
              type : "User"
              updated_at : "2022-11-14T09:16:18Z"
              url : "https://api.github.com/users/Base2526"
              */

              /*
              save data user
              
              input = {...input, displayName: input.username}
              return await User.create(input);
              */

              /*
              username: { type: String },
              password: { type: String },
              email: { type: String },
              displayName: { type: String },
              roles: [{ type: String }],
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
              */

              let newInput = {
                username: github_user.email,
                password: cryptojs.AES.encrypt(data.code, process.env.JWT_SECRET).toString(),
                email: github_user.email,
                displayName: github_user.name,
                roles: ['62a2ccfbcf7946010d3c74a4', '62a2ccfbcf7946010d3c74a6'], // anonymous, authenticated
                isActive: 'active',
                image :[{
                  url: github_user.avatar_url,
                  filename: data.code +".jpeg",
                  mimetype: 'image/jpeg',
                  encoding: '7bit',
                }],
                lastAccess : Date.now(),
                isOnline: true,
                socialType: 'github',
                socialId: data.code,
                socialObject: JSON.stringify(github_user)
              }
              user = await User.create(newInput);
            }

            console.log("GITHUB :", user)

            let sessionId = await getSessionId(user._id.toString(), input)
            return {
              status:true,
              data: user,
              sessionId,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          } catch(err) {
            logger.error(err.toString());
    
            return {
              status: false,
              message: err.toString(),
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }
        }

        case "facebook":{
          try{

            /*
            {
              "name": "Somkid Sim",
              "email": "android.somkid@gmail.com",
              "picture": {
                  "data": {
                      "height": 50,
                      "is_silhouette": false,
                      "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=5031748820263498&height=50&width=50&ext=1671182329&hash=AeQLQloZ6CBWqqOkPFg",
                      "width": 50
                  }
              },
              "id": "5031748820263498",
              "accessToken": "EAARcCUiGLAQBAB4mB4GalPuSBMId15c4hEr3CSEYNxQERzKSnExjuQFuxsOif3MbmZCwm5nwwQNh1tFZBiJjCZB5CiKFHShYM3DHGOZB2QkMYFBWbcs6sRClw5BI7YsOLdtJNYHVpBqjvjdbQwWKtiNzZB1HttaVEDvYqUkWkPiKMR2n7IwC2dZCKJ582fkyN5ZCFdN8nBvcsZBTSRYivvFf",
              "userID": "5031748820263498",
              "expiresIn": 6072,
              "signedRequest": "AKX_cpK80gAe_KXsAIFB3SM8348W2xe9j_PbqPfSNcQ.eyJ1c2VyX2lkIjoiNTAzMTc0ODgyMDI2MzQ5OCIsImNvZGUiOiJBUUM5MTNhVXJHRGRfMVBRWmtpV0VOY0lRckVMRkdVUVo5eldvQkdNUUVxbUhRekd0N1lWSi1aZWRrRHpSY2w2em1udjVQX1ZnZno0UHBYTGJSS0FWZU1GWkpTTzhsVDM3SmNpYkZwWFA3Q3VMelNsVmJ3YXpCT1pjNXI3bFJmMlNGV1JUWUJJbHhDZGN0Q0N6WExzU2dLeTlkRFQ0UGtBV2ZSa1Bpc2dUS21yanRpMi1ELWZ0cjF5dEJ1Y1N3cDZQNVVHa2REaXRYTVgwZU9DYWlmeFVzeS1HbTJ4NWxoR25wczgzWmFrSDZ6TGltcENxdXplVjBPMVFlcEppMmstb2ozc09ueW9KSnE0Vzc4emJ1X1ZvLWhvd3FrZEtsTkxucWVLX09TMDhKUmwxQjhTXzdxcFZHZ243a283TWM1MHg2OGlmQzhPaFgxWURpNjFadDBCVWNaQiIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjY4NTkwMzI4fQ",
              "graphDomain": "facebook",
              "data_access_expiration_time": 1676366328
            }
            */

            let { data } = input

            let user = await User.findOne({socialId: data.id, socialType: 'facebook'});

            if(_.isEmpty(user)){
              let newInput = {
                username: data.email,
                password: cryptojs.AES.encrypt(data.id, process.env.JWT_SECRET).toString(),
                email: data.email,
                displayName: data.name,
                roles: ['62a2ccfbcf7946010d3c74a4', '62a2ccfbcf7946010d3c74a6'], // anonymous, authenticated
                isActive: 'active',
                image :[{
                  url: _.isEmpty(data.picture.data) ? "" : data.picture.data.url,
                  filename: data.id +".jpeg",
                  mimetype: 'image/jpeg',
                  encoding: '7bit',
                }],
                lastAccess : Date.now(),
                isOnline: true,
                socialType: 'facebook',
                socialId: data.id,
                socialObject: JSON.stringify(data)
              }
              user = await User.create(newInput);

              console.log("FACEBOOK : new")
            }else{
              let newInput = {
                username: data.email,
                email: data.email,
                displayName: data.name,
                image :[{
                  url: _.isEmpty(data.picture.data) ? "" : data.picture.data.url,
                  filename: data.id +".jpeg",
                  mimetype: 'image/jpeg',
                  encoding: '7bit',
                }],
                lastAccess : Date.now(),
                socialType: 'facebook',
                socialObject: JSON.stringify(data)
              }

              await User.findOneAndUpdate({ _id : user._id.toString()}, newInput, { new: true })

              console.log("FACEBOOK : update")
            }

            console.log("FACEBOOK :", user)

            let sessionId = await getSessionId(user._id.toString(), input)
            return {
              status:true,
              data: user,
              sessionId,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }catch(err){
            logger.error(err.toString());
            return {
              status: false,
              message: err.toString(),
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }
        }

        default:{
          return {
            status: false,
            message: "other case",
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }
      }
    },

    // search
    async search(parent, args, context, info) {
      
      if(_.isEmpty(context)){
        // logger.error(JSON.stringify(args));
        return;
      }

      let {type, q} = args

      logger.info(args);
      
      return {'status': 'OK', args};
    },


    // user
    async createUser(parent, args, context, info) {
      
      if(_.isEmpty(context)){
        // logger.error(JSON.stringify(args));
        return;
      }

      let {input} = args

      input = {...input, displayName: input.username}
      return await User.create(input);
    },
    async updateUser(parent, args, context, info) {

      let start = Date.now()

      try{
        let { req } = context
        
        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization

        let { input} = args
        
        if(!_.isEmpty(input.files)){
          let newFiles = [];

          const { createReadStream, filename, encoding, mimetype } = (await input.files).file

          const stream = createReadStream();
          const assetUniqName = fileRenamer(filename);
          let pathName = `/app/uploads/${assetUniqName}`;
          
          const output = fs.createWriteStream(pathName)
          stream.pipe(output);

          await new Promise(function (resolve, reject) {
            output.on('close', () => {
              resolve();
            });
      
            output.on('error', (err) => {
              logger.error(err.toString());

              reject(err);
            });
          });

          newFiles.push({ url: `${process.env.RA_HOST}${assetUniqName}`, filename, encoding, mimetype });
        
        
          input = {...input, image: newFiles}
        }

        delete input.files;

        return await User.findOneAndUpdate({ _id : current_user?._id.toString() }, input, { new: true })
      } catch(err) {
        logger.error(err.toString());

        console.log("UpdateUser err :", err.toString())
        
        return {
          status: false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },
    async deleteUser(parent, args, context, info){
      try{
        let { _id } = args
        console.log("deleteUser :", _id)

        let user = await User.findByIdAndRemove({_id})

        // pubsub.publish('POST', {
        //   post:{
        //       mutation: 'DELETED',
        //       data: post
        //   }
        // });
        
        return user;
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    // user

    /*
    (parent, args, context, info) {
      // let { currentUser } = context

      // if(_.isEmpty(currentUser)){
      //   return;
      // }

      console.log("addMessage : ", args)

      let { userId, conversationId, input } = args


      ///////////////////////
      if(input.type === "image"){
        let {payload, files} = input

        let url = [];
        for (let i = 0; i < files.length; i++) {
    */

    // post
    async createPost(parent, args, context, info){
      try{
        let { input } = args

        let post = null;
        if(!input?.fake){
          let newFiles = [];

          // console.log("input.files :", input.files, _.isEmpty(input.files) ? "Y" : "N")
          if(!_.isEmpty(input.files)){
            // console.log("createPost :", input.files)
            
            for (let i = 0; i < input.files.length; i++) {
  
              console.log("updatePost #1234:", await input.files[i])
              const { createReadStream, filename, encoding, mimetype } = (await input.files[i]).file //await input.files[i];
  
              const stream = createReadStream();
              const assetUniqName = fileRenamer(filename);
              let pathName = `/app/uploads/${assetUniqName}`;
    
              const output = fs.createWriteStream(pathName)
              stream.pipe(output);
    
              await new Promise(function (resolve, reject) {
                output.on('close', () => {
                  resolve();
                });
          
                output.on('error', (err) => {
                  logger.error(err.toString());
    
                  reject(err);
                });
              });
    
              const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
              newFiles.push({ url: urlForArray, filename, encoding, mimetype });
            }
  
            console.log("newFiles :", newFiles)
  
          }
  
          post = await Post.create({...input, files:newFiles});
        }else{
          post = await Post.create(input);
        }


        console.log("createPost #1 :", input)
        pubsub.publish('POST', {
          post:{
            mutation: 'CREATED',
            data: post
          }
        });

        return post;
      } catch(err) {
        logger.error(err.toString());

        console.log("createPost #2 :", err.toString())
        return;
      }
    },

    async updatePost(parent, args, context, info) {
      
      try{
        let { _id, input } = args


        console.log("updatePost :", _id , input)

        let newFiles = [];
        if(!_.isEmpty(input.files)){

          for (let i = 0; i < input.files.length; i++) {
            try{
              let fileObject = (await input.files[i]).file

              if(!_.isEmpty(fileObject)){
                const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
                const stream = createReadStream();
                const assetUniqName = fileRenamer(filename);
                let pathName = `/app/uploads/${assetUniqName}`;
                
      
                const output = fs.createWriteStream(pathName)
                stream.pipe(output);
      
                await new Promise(function (resolve, reject) {
                  output.on('close', () => {
                    resolve();
                  });
            
                  output.on('error', (err) => {
                    logger.error(err.toString());
      
                    reject(err);
                  });
                });
      
                const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
                newFiles.push({ url: urlForArray, filename, encoding, mimetype });
              }else{
                if(input.files[i].delete){
                  let pathUnlink = '/app/uploads/' + input.files[i].url.split('/').pop()
                  fs.unlink(pathUnlink, (err)=>{
                      if (err) {
                        logger.error(err);
                      }else{
                        // if no error, file has been deleted successfully
                        console.log('File has been deleted successfully ', pathUnlink);
                      }
                  });
                }else{
                  newFiles = [...newFiles, input.files[i]]
                }
              }
              // console.log("updatePost #6:", newFiles)
            } catch(err) {
              logger.error(err.toString());
            }
          }
        }

        let newInput = {...input, files:newFiles}

        let post = await Post.findOneAndUpdate({
          _id
        }, newInput, {
          new: true
        });

        // 

        pubsub.publish("POST", {
          post: {
            mutation: "UPDATED",
            data: post,
          },
        });

        return post;
      } catch(err) {
        logger.error(err.toString());
        return;
      }

    
    },

    async deletePost(parent, args, context, info) {
      try{
        let { _id } = args
        console.log("deletePost :", _id)

        let post = await Post.findByIdAndRemove({_id})

        pubsub.publish('POST', {
          post:{
              mutation: 'DELETED',
              data: post
          }
        });
        
        return post;
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },

    // deletePosts
    async deletePosts(root, {
      _ids
    }) {
      
      console.log("deletePosts :",JSON.parse(JSON.stringify(_ids)))

      let deleteMany =  await Post.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },

    // post

    // role     
    async createRole(parent, args, context, info) {
      try{
        let { input } = args
        return await Role.create(JSON.parse(JSON.stringify(input)));
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async updateRole(parent, args, context, info) {
      try{
        let { _id, input } = args
      
        return await Role.findOneAndUpdate({ _id }, input, { new: true })
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async deleteRole(parent, args, context, info) {
      try{
        let { _id } = args

        return await Role.findByIdAndRemove({_id})
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async deleteRoles(parent, args, context, info) {
      try{
        let { _ids } = args

        return await Role.deleteMany({_id: { $in: _ids }});
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    // role

    // bank
    async createBank(parent, args, context, info){
      try{
        let { input } = args
        return await Bank.create(JSON.parse(JSON.stringify(input)));
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async updateBank(parent, args, context, info) {
      try{
        let {_id, input } = args
        
        return await Bank.findOneAndUpdate({ _id }, input, { new: true })
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async deleteBank(parent, args, context, info) {
      try{
        let { _id } = args
        console.log("deleteBank :", _id)

        let bank = await Bank.findByIdAndRemove({_id})

        // pubsub.publish('POST', {
        //   post:{
        //       mutation: 'DELETED',
        //       data: post
        //   }
        // });
        
        return bank;
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async deleteBanks(root, {
      _ids
    }) {
      console.log("deleteBanks :", _ids)

      let deleteMany =  await Bank.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },
    // bank


   // basic content

    async createBasicContent(root, {
      input
    }) {
      console.log("CreateBasicContent :",JSON.parse(JSON.stringify(input)))

      return await BasicContent.create(JSON.parse(JSON.stringify(input)));
    },
    async updateBasicContent(parent, args, context, info) {
      try{
        let { _id, input } = args

        return await BasicContent.findOneAndUpdate({ _id }, input, { new: true })
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    async deleteBasicContent(parent, args, context, info) {
      try{
        let { _id } = args
        console.log("deleteBasicContent :", _id)

        let basicContent = await BasicContent.findByIdAndRemove({_id})

        // pubsub.publish('POST', {
        //   post:{
        //       mutation: 'DELETED',
        //       data: post
        //   }
        // });
        
        return basicContent;
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },

   // basic content

    // mail
    async createMail(root, {
      input
    }) {
      console.log("createMail :",JSON.parse(JSON.stringify(input)))

      return await Mail.create(JSON.parse(JSON.stringify(input)));
    },
    async updateMail(root, {
      _id,
      input
    }) {
      console.log("updateMail :", _id, JSON.parse(JSON.stringify(input)))
      
      return await Mail.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },
    async deleteMail(root, {
      _id
    }) {
      console.log("deleteMail :", _id)

      return await Mail.findByIdAndRemove({_id})
    },
    async deleteMails(root, {
      _ids
    }) {
      console.log("deleteMails :", _ids)

      let deleteMany =  await Mail.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },


    // mail

    // comment
    async createAndUpdateComment(parent, args, context, info) {
      let start = Date.now()

      try{

        let { req } = context

        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization

        console.log("createAndUpdateComment :", args, current_user)

        let { input } = args

        let {postId, data} = input

        let resultComment = await Comment.findOneAndUpdate({
          postId: input.postId
        }, input, {
          new: true
        })
        
        if(resultComment === null){
          resultComment = await Comment.create(input);

          pubsub.publish("COMMENT", {
            comment: {
              mutation: "CREATED",
              commentID: input.postId,
              data: resultComment.data,
            },
          });
        }else{
          pubsub.publish("COMMENT", {
            comment: {
              mutation: "UPDATED",
              commentID: input.postId,
              data: resultComment.data,
            },
          });
        }

        ////////////////// send notification //////////////////

        input = {...input, commentID: resultComment._id.toString()}

        _.map(input.data, async(item)=>{
          // replies  notify
          if(item.notify){
            // item.userId

            // หาเจ้าของ โพส แล้วส่ง notify ไปหา เจ้าของโพส
            let post = await Post.findById(postId);
            if(post){
              let {ownerId} = post

              if(ownerId !== item.userId){

                let resultNoti = await Notification.create({
                                                          user_to_notify: ownerId,
                                                          user_who_fired_event: item.userId,
                                                          type: "comment",
                                                          text: item.text,
                                                          status: "send",
                                                          input
                                                        });

                pubsub.publish("NOTIFICATION", {
                  notification: {
                    mutation: "CREATED",
                    data: resultNoti,
                  },
                });
              }
            }
          }

          _.map(item.replies, async(replie)=>{
            if(replie.notify){

              console.log("#2 :", item.userId, replie.userId)

              if(item.userId !== replie.userId){

                let resultNoti =  await Notification.create({
                                            user_to_notify: item.userId,
                                            user_who_fired_event: replie.userId,
                                            type: "comment",
                                            text: replie.text,
                                            status: "send",
                                            input
                                          });

                pubsub.publish("NOTIFICATION", {
                  notification: {
                    mutation: "CREATED",
                    data: resultNoti,
                  },
                });
              }
            }
          })
        })

        ////////////////// send notification //////////////////
                  
        return {
          status:true,
          data: resultComment.data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());

        return {
          status:false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },

    async updateComment(root, {
      _id,
      input
    }) {
      console.log("updateComment :", _id, JSON.parse(JSON.stringify(input)))
      
      return await Comment.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },

    async deleteComment(root, {
      _id
    }) {
      console.log("deleteComment :", _id)

      return await Comment.findByIdAndRemove({_id})
    },
    async deleteComment(root, {
      _ids
    }) {
      console.log("deleteComment :", _ids)

      let deleteMany =  await Comment.deleteMany({_id: {
        $in: _ids,
      }})
      return deleteMany;
    },
    // comment
    
    async createAndUpdateBookmark(parent, args, context, info) {
      try{
        let { req } = context

        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization

        let {input} = args

        /**
         * validate data
        */
        if(_.isEmpty(await Post.findById(input.postId))){
          // logger.error("Post id empty :", input.postId)
          return;
        } 

        input = {...input, userId: current_user?._id}

        let result = await Bookmark.findOneAndUpdate({
          postId: input.postId
        }, input, {
          new: true
        })
      
        if(result === null){
          result = await Bookmark.create(input);

          pubsub.publish("BOOKMARK", {
            bookmark: {
              mutation: "CREATED",
              data: result,
            },
          });
        }else{

          pubsub.publish("BOOKMARK", {
            bookmark: {
              mutation: "UPDATED",
              data: result,
            },
          });
        }

        return result;

      } catch(err) {
        logger.error(err.toString());
        
        return {
          status:false,
          message: err.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },
    async createAndUpdateFollow(parent, args, context, info) {

      if(_.isEmpty(context)){
        // logger.error(JSON.stringify(args));
        return;
      }
      
      let {input} = args

      /**
       * validate data
      */
      if(_.isEmpty(await User.findById(input.userId))){
        // logger.error("User id empty :", input.userId)
        return;
      } 

      if(_.isEmpty(await User.findById(input.friendId))){
        // logger.error("User id empty :", input.friendId)
        return;
      } 
      /**
       * validate data
      */

      let result = await Follow.findOneAndUpdate({
        userId: input.userId, friendId: input.friendId
      }, input, {
        new: true
      })
     
      if(result === null){
        result = await Follow.create(input);
      }

      return result;
    },
    // TReport
    async createTReport(root, {
      input
    }) {
      console.log("createTReport")

      return await tReport.create(input);
    },
    async updateTReport(root, {
      _id,
      input
    }) {
      console.log("updateTReport :", _id )
      
      return await tReport.findOneAndUpdate({
        _id
      }, input, {
        new: true
      })
    },
    async deleteTReport(root, {
      _id
    }) {
      console.log("deleteTReport :", _id)

      return await tReport.findByIdAndRemove({_id})
    },
    async deleteTReportList(root, {
      _ids
    }) {
      console.log("deleteTReportList :", _ids)
      return await tReport.deleteMany({_id: {
        $in: _ids,
      }})
    },
    // TReport

    async createReport(parent, args, context, info) {

      if(_.isEmpty(context)){
        // logger.error(JSON.stringify(args));
        return;
      }

      let {input} = args

      /**
       * validate data
      */
      if(_.isEmpty(await Post.findById(input.postId))){
        // logger.error("Post id empty : ", input.postId)
        return;
      } 

      if(_.isEmpty(await User.findById(input.userId))){
        // logger.error("User id empty : ", input.userId)
        return;
      } 
      /**
       * validate data
      */

      return await Report.create(input);
    },
    async createShare(parent, args, context, info) {

      let {input} = args
      let share = await Share.create(input);

      console.log("createShare :", share)

      pubsub.publish("SHARE", {
        share: {
          mutation: "CREATED",
          data: share,
        },
      });

      return share;
    },
    async createConversation(parent, args, context, info) {
      try{
        let {input} = args
        
        let currentUser = await User.findById(input.userId);
        let friend = await User.findById(input.friendId);

        let result =  await Conversation.findOne({ "members.userId": { $all: [ currentUser._id.toString(), input.friendId ] } });
                        
        if(result === null){
          result = await Conversation.create({
            // name: friend.displayName,
            lastSenderName: currentUser.displayName,
            info:"",
            // avatarSrc: _.isEmpty(friend.image) ? "" :  friend.image[0].base64,
            // avatarName: friend.displayName,
            senderId: currentUser._id.toString(),
            status: "available",
            // unreadCnt: 0,
            sentTime: Date.now(),
            // userId: input.friendId,
            // members: [input.userId, input.friendId],
            // members: {[input.userId]:{ 
            //                           name: currentUser.displayName, 
            //                           avatarSrc: _.isEmpty(currentUser.image) ? "" :  currentUser.image[0].base64,
            //                           unreadCnt: 0 
            //                         }, 
            //           [input.friendId]:{ 
            //                           name: friend.displayName, 
            //                           avatarSrc: _.isEmpty(friend.image) ? "" :  friend.image[0].base64,
            //                           unreadCnt: 0 
            //                         }},
            members:[
              { 
                userId: currentUser._id.toString(),
                name: currentUser.displayName, 
                avatarSrc: _.isEmpty(currentUser.image) ? "" :  currentUser.image[0].url,
                unreadCnt: 0 
              },
              {
                userId: input.friendId,
                name: friend.displayName, 
                avatarSrc: _.isEmpty(friend.image) ? "" :  friend.image[0].url,
                unreadCnt: 0 
              }
            ]
          });

          pubsub.publish("CONVERSATION", {
            conversation: {
              mutation: "CREATED",
              data: result,
            },
          });
        }else{
          pubsub.publish("CONVERSATION", {
            conversation: {
              mutation: "UPDATED",
              data: result,
            },
          });
        }
        
        return result;

      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },

    async updateConversation(parent, args, context, info) {
      try{
        let {_id, input} = args

        let result = await Conversation.findOneAndUpdate({
          _id
        }, input, {
          new: true
        })

        pubsub.publish("CONVERSATION", {
          conversation: {
            mutation: "UPDATED",
            data: result,
          },
        });

        console.log("updateConversation friend : ", result)

        return result;
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },

    async addMessage(parent, args, context, info) {
      // let { currentUser } = context

      // if(_.isEmpty(currentUser)){
      //   return;
      // }

      console.log("addMessage : ", args)

      let { userId, conversationId, input } = args


      let { req } = context

      let authorization = await checkAuthorization(req);
      let { status, code, current_user } =  authorization


      ///////////////////////
      if(input.type === "image"){
        let {payload, files} = input

        let url = [];
        for (let i = 0; i < files.length; i++) {
          const { createReadStream, filename, encoding, mimetype } = await files[i];
          const stream = createReadStream();
          const assetUniqName = fileRenamer(filename);
          let pathName = `/app/uploads/${assetUniqName}`;
          

          const output = fs.createWriteStream(pathName)
          stream.pipe(output);

          await new Promise(function (resolve, reject) {
            output.on('close', () => {
              resolve();
            });
      
            output.on('error', (err) => {
              logger.error(err.toString());

              reject(err);
            });
          });

          const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
          url.push({ url: urlForArray });
        }

        input = {...input, payload: _.map(payload, (p, index)=>{ return {...p, src: url[index].url} })}
        input = _.omit(input, ['files'])
      }

      /////////////////////////

      let result = await Message.findById(input._id);

      // let currentUser = await User.findById(userId);
      
      if(_.isEmpty(result)){
        input = { ...input, 
                  conversationId, 
                  senderId: current_user?._id.toString(), 
                  senderName: current_user?.displayName, 
                  sentTime: Date.now(), 
                  status: "sent",
                  reads: []}
         
        result = await Message.create(input);

        try {
          let conversation = await Conversation.findById(conversationId);
  
          if(!_.isEmpty(conversation)){
            conversation = _.omit({...conversation._doc}, ["_id", "__v"])
  
            let newMember = _.find(conversation.members, member => member.userId != current_user?._id.toString());
  
  
            // หาจำนวน unread total = (await Post.find().lean().exec()).length; 
            // https://www.educative.io/answers/what-is-the-ne-operator-in-mongodb
            let unreadCnt = (await Message.find({ conversationId, 
                                                  senderId: {$all : current_user?._id.toString()}, 
                                                  status: 'sent',
                                                  reads: { $nin: [ newMember.userId ] }}).lean().exec()).length; 
            // หาจำนวน unread
  
            newMember = {...newMember, unreadCnt}
            
            let newMembers = _.map(conversation.members, (member)=>member.userId == newMember.userId ? newMember : member)
  
            conversation = {...conversation, lastSenderName:current_user?.displayName, info:input.message, sentTime: Date.now(), members: newMembers }
  
            let conversat = await Conversation.findOneAndUpdate({ _id : conversationId }, conversation, { new: true })
  
            let p = pubsub.publish("CONVERSATION", {
              conversation: {
                mutation: "UPDATED",
                data: conversat,
              },
            });
          }
        } catch (err) {
          console.log("conversation err:" , err)
        }

        pubsub.publish('MESSAGE', {
          message:{
            mutation: 'CREATED',
            data: result
          }
        });
      }

      return result;
    },

    async updateMessageRead(parent, args, context, info) {
      let { conversationId } = args

      // console.log("updateMessageRead :", userId, conversationId)

      // let currentUser = await User.findById(userId);

      let conversation = await Conversation.findById(conversationId);

      if(!_.isEmpty(conversation)){

        let { req } = context

        let authorization = await checkAuthorization(req);
        let { status, code, current_user } =  authorization


        // update all message to read
        await Message.updateMany({
            conversationId, 
            senderId: { $nin: [ current_user?._id.toString() ] },
            status: 'sent',
            reads: { $nin: [ current_user?._id.toString() ] }
          }, 
          // {$set: {reads: [ userId ] }}
          { $push: {reads: current_user?._id.toString() } }
        )

        // update conversation  unreadCnt = 0
        conversation = _.omit({...conversation._doc}, ["_id", "__v"])
    
        conversation = {...conversation, members: _.map(conversation.members, (member)=>member.userId == current_user?._id.toString() ? {...member, unreadCnt:0} : member) }

        let newConversation = await Conversation.findOneAndUpdate({ _id : conversationId }, conversation, { new: true })


        let UPDATED =  {
          mutation: "UPDATED",
          data: newConversation,
        }

        pubsub.publish("CONVERSATION", {
          conversation: UPDATED
        });

        return UPDATED;
      }
      
      return;
    },

    // https://medium.com/geekculture/multiple-file-upload-with-apollo-server-3-react-graphql-da87880bc01d
    async fileUpload(parent, args, context, info){
      try{
        let start = Date.now()

        console.log("fileUpload :", args)

        let {file} = args

        let url = [];
        for (let i = 0; i < file.length; i++) {
          const { createReadStream, filename, encoding, mimetype } = await file[i];
          const stream = createReadStream();
          const assetUniqName = fileRenamer(filename);
          let pathName = `/app/uploads/${assetUniqName}`;

          const output = fs.createWriteStream(pathName)
          stream.pipe(output);

          await new Promise(function (resolve, reject) {
            output.on('close', () => {
              resolve();
            });
      
            output.on('error', (err) => {
              logger.error(err.toString());

              reject(err);
            });
          });

          const urlForArray = `${process.env.RA_HOST}${assetUniqName}`;
          url.push({ url: urlForArray });
        }

        console.log("url : ", url , `Time to execute = ${ (Date.now() - start) / 1000 } seconds`)

      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
    
    async createPhone(parent, args, context, info){
      try{
        let start = Date.now()

        let { req } = context

        ///////////////////////////
        let authorization = await checkAuthorization(req);
        console.log("authorization :", authorization)

        let { status, code, current_user } =  authorization
        //////////////////////////


        let { input } = args

        console.log("createPhone > input : args : ", args)

        input = {...input, ownerId: current_user?._id}

        let data = await Phone.create(input);
        return {
          status: true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      } catch(err) {
        logger.error(err.toString());

        console.log(err.toString())
        return;
      }
    },

    async updatePhone(parent, args, context, info){
      try{
        let start = Date.now()
        let { _id, input } = args

       
        ///////////////////////////
        let { req } = context
        let authorization = await checkAuthorization(req);
        console.log("authorization :", authorization)

        let { status, code, current_user } =  authorization
        //////////////////////////
 
        let data = await Phone.findOneAndUpdate({ _id, ownerId: current_user?._id }, input, { new: true })

        return {
          status: true,
          data,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },

    async deletePhone(parent, args, context, info) {
      try{
        let { _id } = args
        console.log("deletePhone :", _id)

        let phone = await Phone.findByIdAndRemove({_id})

        // pubsub.publish('PHONE', {
        //   phone:{
        //       mutation: 'DELETED',
        //       data: phone
        //   }
        // });
        
        return phone;
      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },

    // https://github.com/PrincewillIroka/login-with-github/blob/master/server/index.js
    async loginWithGithub(parent, args, context, info){
      try{
        let start = Date.now()

        let { code } = args

        console.log("loginWithGithub :", args)

        const data = new FormData();
        data.append("client_id", "04e44718d32d5ddbec4c");
        data.append("client_secret", "dd1252dea6ec4d05083dc2c2cd53def7be4a9033");
        data.append("code", code);
        // data.append("redirect_uri", "https://banlist.info");

        // Request to exchange code for an access token
        let github_user = await fetch(`https://github.com/login/oauth/access_token`, { method: "POST", body: data })
                                    .then((response) => response.text())
                                    .then((paramsString) => {
                                      let params = new URLSearchParams(paramsString);

                                      console.log("params :", params)

                                      logger.error(JSON.stringify(params));
                                      
                                      let access_token = params.get("access_token");
                                
                                      // Request to return data of a user that has been authenticated
                                      return fetch(`https://api.github.com/user`, {
                                        headers: {
                                          Authorization: `token ${access_token}`,
                                        },
                                      });
                                    })
                                    .then((response) => response.json())

        console.log("github_user :", github_user)
        console.log(`Time to execute = ${ (Date.now() - start) / 1000 } seconds`)

      } catch(err) {
        logger.error(err.toString());
        return;
      }
    },
  },
  Subscription:{
    numberIncremented: {
      resolve: (payload) =>{
        console.log("payload :", payload)
        return 1234
      },
      subscribe: (parent, args, context, info) =>{
        console.log("parent, args, context, info > :", parent, args, context)
        return pubsub.asyncIterator(["NUMBER_INCREMENTED"])
      } ,

      /*
      // subscribe: withFilter((parent, args, context, info) => {
      //   console.log("parent, args, context, info :", parent, args, context)
      //   return context.pubsub.asyncIterator(["NUMBER_INCREMENTED"])
      // },
      // (payload, variables) => {
      //   console.log(">>>>>>>>>>>>>>>>>>> ", payload, variables)

      //   return payload.channelId === variables.channelId;
      // })
      */
    },
    // withFilter

    postCreated: {
      // More on pubsub below
      resolve: (payload) => 122,
      subscribe: (parent, args, context, info) =>{
        return pubsub.asyncIterator(['POST_CREATED'])
      } ,
    },
    subPost:{

      resolve: (payload) =>{
        // console.log("subPost : >>>>>>>>>>>>>>>>>>> payload : ", payload)
        return payload.post
      },
      subscribe: withFilter((parent, args, context, info) => {
          // console.log("subPost : parent, args, context, info :", parent, args, context)
          return pubsub.asyncIterator(["POST"])
        }, (payload, variables) => {
          let {mutation, data} = payload.post
          switch(mutation){
            case "CREATED":
            case "UPDATED":
            case "DELETED":
              {
                break;
              }
          }

          return _.findIndex(JSON.parse(variables.postIDs), (o) => _.isMatch(o, data.id) ) > -1;
        }
      )
    },
    subComment:{

      resolve: (payload) =>{
        return payload.comment
      },
      subscribe: withFilter((parent, args, context, info) => {
          // console.log("subComment : parent, args, context, info :", parent, args, context)
          return pubsub.asyncIterator(["COMMENT"])
        }, (payload, variables) => {
          let {mutation, commentID, data} = payload.comment
          switch(mutation){
            case "CREATED":
            case "UPDATED":
            case "DELETED":
              {
                break;
              }
          }

          return commentID == variables.commentID;
        }
      )
    },
    subBookmark: {
      resolve: (payload) =>{
        return payload.bookmark
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["BOOKMARK"])
        }, (payload, variables) => {
          let {mutation, data} = payload.bookmark
          // switch(mutation){
          //   case "CREATED":
          //   case "UPDATED":
          //   case "DELETED":
          //     {
          //       break;
          //     }
          // }
          return data.postId == variables.postId;// && data.userId == variables.userId;
        }
      )
    },
    subShare: {
      resolve: (payload) =>{
        return payload.share
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["SHARE"])
        }, (payload, variables) => {
          let {mutation, data} = payload.share

          // console.log("subShare: ", data, payload, variables)
          // switch(mutation){
          //   case "CREATED":
          //   case "UPDATED":
          //   case "DELETED":
          //     {
          //       break;
          //     }
          // }
          return data.postId == variables.postId;
        }
      )
    },
    subConversation: {
      resolve: (payload) =>{
        return payload.conversation
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["CONVERSATION"])
        }, (payload, variables, context) => {
          let {mutation, data} = payload.conversation
          
          // let {currentUser} = context
          // if(_.isEmpty(currentUser)){
          //   return false;
          // }

          // console.log("CONVERSATION: ", payload)
          switch(mutation){
            case "CREATED":
            case "UPDATED":
            case "DELETED":
              {
                return _.findIndex(data.members, (o) => o.userId == variables.userId ) > -1
              }

            case "CONNECTED":
            case "DISCONNECTED":{
              // console.log("CONVERSATION :::: ", mutation, data)
            }
          }

          return false;
          
        }
      )
    },
    subNotification: {
      resolve: (payload) =>{
        return payload.notification
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["NOTIFICATION"])
        }, (payload, variables, context) => {
          let {mutation, data} = payload.notification
          
          // let {currentUser} = context
          // if(_.isEmpty(currentUser)){
          //   return false;
          // }

          console.log("NOTIFICATION: ", payload, variables, data)
          // switch(mutation){
          //   case "CREATED":
          //   case "UPDATED":
          //   case "DELETED":
          //     {
          //       return _.findIndex(data.members, (o) => o.userId == variables.userId ) > -1
          //     }

          //   case "CONNECTED":
          //   case "DISCONNECTED":{
          //     // console.log("CONVERSATION :::: ", mutation, data)
          //   }
          // }

          return data.user_to_notify === variables.userId;
        }
      )
    },
    subMessage: {
      resolve: (payload) =>{
        return payload.message
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["MESSAGE"])
        }, async (payload, variables, context) => {
          let {mutation, data} = payload.message

          if(variables.conversationId === data.conversationId &&  variables.userId !== data.senderId) {
            
            let conversation = await Conversation.findById(variables.conversationId);

            // console.log("MESSAGE ::", variables, data)

            if(!_.isEmpty(conversation)){

              // update all message to read
              await Message.updateMany({
                  conversationId: variables.conversationId, 
                  senderId: { $nin: [ variables.userId ] },
                  status: 'sent',
                  reads: { $nin: [ variables.userId ] }
                }, 
                // {$set: {reads: [ userId ] }}
                { $push: {reads: variables.userId } }
              )

              // update conversation  unreadCnt = 0
              conversation = _.omit({...conversation._doc}, ["_id", "__v"])
          
              conversation = {...conversation, members: _.map(conversation.members, (member)=>member.userId == variables.userId ? {...member, unreadCnt:0} : member) }

              let newConversation = await Conversation.findOneAndUpdate({ _id : variables.conversationId }, conversation, { new: true })

              pubsub.publish("CONVERSATION", {
                conversation: {
                  mutation: "UPDATED",
                  data: newConversation,
                }
              });

              // return UPDATED;
            }
          }

          // let {currentUser} = context
          // if(_.isEmpty(currentUser)){
          //   return false;
          // }

          // switch(mutation){
          //   case "CREATED":
          //   case "UPDATED":
          //   case "DELETED":
          //     {
          //       break;
          //     }
          // }

          return data.conversationId === variables.conversationId && data.senderId !== variables.userId
        }
      )
    },
    // subUserTrack: {
    //   resolve: (payload) =>{
    //     return payload.user_track
    //   },
    //   subscribe: withFilter((parent, args, context, info) => {
    //       return pubsub.asyncIterator(["USER_TRACK"])
    //     }, async (payload, variables, context) => {
    //       let {mutation, data} = payload.user_track

    //       console.log("USER_TRACK :", mutation, data, variables)

    //       return false
    //     }
    //   )
    // }
  }

  // commentAdded
};
