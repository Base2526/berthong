import { withFilter } from 'graphql-subscriptions';
import _ from "lodash";
import FormData from "form-data";
import cryptojs from "crypto-js";
import deepdash from "deepdash";
deepdash(_);
import * as fs from "fs";
import mongoose from 'mongoose';
import fetch from "node-fetch";
import { GraphQLUpload } from 'graphql-upload';

import pubsub from './pubsub'
import AppError from "./utils/AppError"
import logger from "./utils/logger";
import * as cache from "./cache"
import * as Constants from "./constants"
import * as Model from "./model"
import * as Utils from "./utils"
import connection from './mongo'

export default {
  Query: {

    async check_db(parent, args, context, info){
      let { req } = context

      let { readyState } = connection
      let mongo_db_state = "Empty"
      if (readyState === 0) {
        mongo_db_state = "Disconnected"
      } else if (readyState === 1) {
        mongo_db_state = "Connected"
      } else if (readyState === 2) {
        mongo_db_state = "Connecting"
      } else if (readyState === 3) {
        mongo_db_state = "Disconnecting"
      }

      let text = "1234"
      let encrypt = cryptojs.AES.encrypt(text, process.env.JWT_SECRET).toString()
      // encrypt = "U2FsdGVkX18wIs5DOBhZOddShspHwri5Z8KFIXtyHzU="
      let decrypt = cryptojs.AES.decrypt(encrypt, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8);
      console.log("encrypt ++ :", encrypt, decrypt)
  
      return { status:true, "mongo db state" : mongo_db_state }
    },

    async ping(parent, args, context, info){
      let { req } = context

      const session = await mongoose.startSession();
      session.startTransaction()

      try {
        // await Model.Test.create({ message: "ACCC" });
        // await session.commitTransaction();
        // console.log("ping #1")

        console.log("process.env ", process.env )

      }catch(error){
        await session.abortTransaction();
        console.log(`ping #2 ${err}`)
      }finally {
        session.endSession();

        console.log("ping #3")
      }      

      // let user  = await Utils.getUser({_id: mongoose.Types.ObjectId("62a2f633cf7946010d3c74fa")})
      // console.log("user doc :", user)
      // let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      //  return (await Model.Role.findById({_id: mongoose.Types.ObjectId(_id)}))?.name

      // let user = await Model.User.findById(mongoose.Types.ObjectId("62a2f65dcf7946010d3c7515"))
      // console.log("ping user :", user, _.isNull(user))
      // let suppliers = await Model.Supplier.findOne({_id: mongoose.Types.ObjectId("63f5c99fee4cff016c214fa3")})
      // console.log("ping suppliers :", suppliers)
      // let v = {
      //             "myKeyA": { my: "Special", variable: 123 },
      //             "myKeyB": { the: "Glory", answer: 42 }
      //         }
      // cache.ca_save("A", v)
      // console.log("AAAAA :", cache.ca_get("A"))
      // if(status && code == 1){
      //   console.log("ping ok : ", current_user?._id)
      // }else{
      //   console.log("ping other")
      // }

      let ca_keys = cache.ca_keys();

      console.log("ping ca_keys :", ca_keys)
      return { status:true }
    },

    async checkCacheById(parent, args, context, info){
      let { req } = context
      let { _id } = args

      let ca_get = cache.ca_get(_id)
      console.log("ca_get :", ca_get)
      // let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      // console.log("checkUser :", current_user, req?.headers?.authorization)
      return { status:true }
    },

    async checkUser(parent, args, context, info){
      let { req } = context
      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      console.log("checkUser :", current_user, req?.headers?.authorization)
      return { status:true }
    },

    async users(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Administrator only!')

      let { OFF_SET, LIMIT } = args?.input
      let users = await Model.User.find({roles: {$nin:[Constants.AMDINISTRATOR]}}, 
                                  { username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, lastAccess: 1 })
                                  .limit(LIMIT)
                                  .skip(OFF_SET); 
      return { 
              status: true,
              data: users,
              total: ( await Utils.getUserFull({roles: {$nin:[Constants.AMDINISTRATOR]}}) )?.length,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
            }
    },

    async userById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      let user = await Utils.getUserFull({_id})
      if(_.isNull(user)) throw new AppError(Constants.USER_NOT_FOUND, 'Model.User not found.')

      return {  status: true,
                data: user,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async roleByIds(parent, args, context, info) {
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Admin only!')

      let data = await Model.Role.find({_id: {$in: args?.input }})
      return {
        status: true,
        data,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async suppliers(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      console.log("suppliers : #0 ", args?.input)
      await Utils.checkAuth(req);

      let { PAGE, LIMIT } = args?.input
      let SKIP = (PAGE - 1) * LIMIT

      console.log("suppliers : #1 ", args?.input)
      let suppliers = await Model.Supplier.aggregate([
                      { $skip: SKIP }, 
                      { $limit: LIMIT }, 
                      {
                          $lookup: {
                              localField: "ownerId",
                              from: "user",
                              foreignField: "_id",
                              pipeline: [
                                { $project:{ username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, subscriber: 1, lastAccess: 1 }}
                              ],
                              as: "owner"
                          }
                      },
                      {
                          $unwind: {
                                  "path": "$owner",
                                  "preserveNullAndEmptyArrays": false
                          }
                      }
                    ])

      return {  
        status: true,
        data: suppliers,
        total: await Utils.getTotalSupplier(),
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
      }
    },

    async supplierById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      await Utils.checkAuth(req);

      return {  status: true,
                data: await Utils.getSupplier({_id}),
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async banks(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      await Utils.checkAuth(req);

      let banks = await Model.Bank.find({})
      if(_.isNull(banks)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')
      return {  status: true,
                data: banks,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async bankById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      await Utils.checkAuth(req);

      let bank = await Model.Bank.findById(_id)
      if(_.isNull(bank)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      return {  status:true,
                data: bank,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async bookBuyTransitions(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      // let transitions = await Model.Transition.find({ userId: current_user?._id, type: Constants.SUPPLIER });

      // transitions = _.filter( await Promise.all(_.map(transitions, async(transition)=>{
      //                 let supplier = await Model.Supplier.findOne( {_id: transition.refId} );//await Utils.getSupplier({_id: transition.refId}) 

      //                 if(supplier){
      //                   let { buys } = supplier
      //                   let book  = _.filter(buys, buy=> _.isEqual(buy.userId, current_user?._id)  && (buy.selected == 0 || buy.selected == 1))
  
      //                   return book?.length > 0 /*|| buy.length > 0*/  ? {...transition._doc, ...supplier._doc } : null
      //                 }
      //                 return null                
      //               })), item=>!_.isNull(item) ) 

      let userId = current_user?._id;

      let transitions = await Model.Transition.aggregate([
        { 
            $match: { userId, type: Constants.SUPPLIER  } 
        },
        {
          $lookup: {
              localField: "refId",
              from: "supplier",
              foreignField: "_id",
              pipeline: [{ $match: { buys: { $elemMatch : { userId }} }}],
              as: "supplier"
          }                 
        },
        {
          $unwind: {
              "path": "$supplier",
              "preserveNullAndEmptyArrays": false
          }
        }
      ])

      return {  status: true,
                data: transitions,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async historyTransitions(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      let userId = current_user?._id
      // let transitions = await Model.Transition.find({ userId });
      // transitions = await Promise.all(_.map(transitions, async(transition)=>{
      //     // export const SUPPLIER       = 10;
      //     // export const DEPOSIT        = 11;
      //     // export const WITHDRAW       = 12;
      //     switch(transition.type){ 
      //       case Constants.SUPPLIER:{
      //           let supplier = await Utils.getSupplier({_id: transition?.refId}) 
      //           let buys = _.filter(supplier?.buys, (buy)=> _.isEqual(buy?.userId, userId))
                
      //           if(_.isEmpty(buys)){
      //             return {};
      //           }
                
      //           let balance = buys?.length * supplier?.price
      //           return {...transition?._doc, 
      //                   title: supplier?.title, 
      //                   balance, 
      //                   description: supplier?.description, 
      //                   dateLottery: supplier?.dateLottery}
      //       }
      //       case Constants.DEPOSIT:{
      //           let deposit = await Model.Deposit.findById(transition.refId)
      //           return {...transition?._doc, ...deposit?._doc}
      //       }
      //       case Constants.WITHDRAW:{
      //           let withdraw = await Model.Withdraw.findById(transition.refId)
      //           return {...transition?._doc, 
      //                   title: "title", 
      //                   balance: withdraw.balance, 
      //                   description: "description", 
      //                   dateLottery: "dateLottery"}
      //       }
      //     }
      // }).filter(i=>!_.isNull(i)))

      let deposit = await Model.Transition.aggregate([
                      { 
                          $match: {userId, status: { $in: [ 13, 14 /*, 0 Constants.WAIT, Constants.APPROVED*/ ] }, type: 11 /* Constants.DEPOSIT = 11 */ } 
                      },
                      {
                          $lookup: {
                              localField: "refId",
                              from: "deposit",
                              foreignField: "_id",
                              as: "deposit"
                          }
                      },
                      {
                        $unwind: {
                          "path": "$deposit",
                          "preserveNullAndEmptyArrays": false
                        }
                      }
                    ])

      let withdraw =  await Model.Transition.aggregate([
                        { 
                            $match: {userId, status: { $in: [ 13, 14 /*, 0 Constants.WAIT, Constants.APPROVED*/ ] }, type: 12 /* Constants.WITHDRAW = 12 */ } 
                        },
                        {
                            $lookup: {
                                localField: "refId",
                                from: "withdraw",
                                foreignField: "_id",
                                as: "withdraw"
                            }
                        },
                        {
                          $unwind: {
                            "path": "$withdraw",
                            "preserveNullAndEmptyArrays": false
                            }
                        }
                      ])

      return {  status: true,
                data: [...deposit, ...withdraw],
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async friendProfile(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      let user = await Utils.getUserFull({_id})
      if(_.isNull(user)) throw new AppError(Constants.USER_NOT_FOUND, 'Model.User not found.')

      let suppliers = await Model.Supplier.find({ownerId: _id});
      if(_.isNull(suppliers)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      return {  status: true,
                data: {...user, suppliers},
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async buys(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      // if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      let transitions = await Model.Transition.find({userId: current_user?._id, type: Constants.SUPPLIER, status: Constants.OK });
      transitions = await Promise.all(_.map(transitions, async(transition)=>{
                          switch(transition.type){ // 'supplier', 'deposit', 'withdraw'
                            case Constants.SUPPLIER:{

                              let supplier = await Utils.getSupplier({_id: transition?.refId}) 
                              let buys     = _.filter(supplier.buys, (buy)=>buy.userId == current_user?._id.toString())
                              // price, buys

                              let balance = buys.length * supplier.price

                              // console.log("transitions > supplier :", supplier)

                              return {...transition._doc, title: supplier.title, balance, description: supplier.description, dateLottery: supplier.dateLottery}
                            }
                          }
                      }))
      return {  status:true,
                data: transitions,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async notifications(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      console.log("notifications: ")

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      // if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      let data = [{ user_to_notify: '63ff3c0c6637e303283bc40f', 
                    type: "system",
                    data: "test [system]",
                    status: "unread"
                  },
                  { user_to_notify: '63ff3c0c6637e303283bc40f', 
                    type: "withdraw",
                    data: "test [withdraw]",
                    status: "unread"
                  },
                  { user_to_notify: '63ff3c0c6637e303283bc40f', 
                    type: "deposit",
                    data: "test [deposit]",
                    status: "unread"
                  }]
      return {  status: true,
                data,
                total: data.length,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async commentById(parent, args, context, info){
      try{
        let start = Date.now()
        let { _id } = args
        let { req } = context

        let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

        let comm = await Model.Comment.findOne({_id});
        return {  status: true,
                  data: _.isNull(comm) ? [] : comm,
                  executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      }catch(error){
        console.log("commentById error :", error)
        return {  status: false,
                  error: error?.message,
                  executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      }
    },

    async bookmarks(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { current_user } =  await Utils.checkAuth(req);

      let suppliers = await Model.Supplier.aggregate([
        { 
            $match: { follows: {$elemMatch: {userId: current_user?._id} }  } 
        },
        {
          $lookup: {
              localField: "ownerId",
              from: "user",
              foreignField: "_id",
              as: "owner"
          }                 
        },
        {
          $unwind: {
              "path": "$owner",
              "preserveNullAndEmptyArrays": false
          }
        }
      ])

      return {  status: true,
                data: suppliers,
                total: suppliers.length,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async subscribes(parent, args, context, info){
      try{
        let start = Date.now()
        let { req } = context

        let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

        let users = await Utils.getUsers({subscriber: { $elemMatch : {userId: current_user?._id }}})
        
        return {  status: true,
                  data: users,
                  total: users.length,
                  executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      }catch(error){
        console.log("commentById error :", error)
        return {  status: false,
                  error: error?.message,
                  executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      }
    },

    async dblog(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Constants.AMDINISTRATOR only!')

      let dblogs = await Model.Dblog.find({})
      
      return {  status: true,
                data:dblogs,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async dateLotterys(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      // if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Constants.AMDINISTRATOR only!')

      let dateLotterys = await Model.DateLottery.find({})

      // if(_.isNull(dateLotterys)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')
      // dateLotterys = await Promise.all( _.map(dateLotterys, async(lo)=>{
      //   let suppliers = await Model.Supplier.find({ dateLottery: lo?._id });
      //   return  {...lo._doc, suppliers }
      // }) )
      // let dateLotterys = await Model.DateLottery.aggregate([
      //   {
      //       $lookup: {
      //           localField: "_id",
      //           from: "supplier",
      //           foreignField: "dateLottery",
      //           as: "suppliers"
      //       }
      //   },
      //   {
      //       $unwind: {
      //               "path": "$suppliers",
      //               "preserveNullAndEmptyArrays": false
      //       }
      //   }
      // ])
      // console.log("dateLotterys :", dateLotterys)
      
      return {  status: true,
                data: dateLotterys,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async dateLotteryById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Constants.AMDINISTRATOR only!')

      let dateLottery = await Model.DateLottery.findById(_id)
      if(_.isNull(dateLottery)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      return {  status: true,
                data: dateLottery,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async adminHome(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      /*
      try{

      }catch(error){
        console
      }
      console.log("adminHome: ", current_user)
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Administrator only!')

      // 0: 'wait', 1: 'approved',  2: 'approved'
      let deposits = await Model.Deposit.find({status: Constants.WAIT})
      deposits  = _.filter(await Promise.all(_.map(deposits, async(deposit)=>{
                                    let f = await Model.Bank.findById(deposit.bank.bankId)
                                    if(_.isNull(f)) return null
                                    return {...deposit._doc, bank: {...deposit.bank, bankName: f?.name}}
                                  })), i=>!_.isEmpty(i))

      let withdraws = await Model.Withdraw.find({status: Constants.WAIT})
      withdraws = _.filter(await Promise.all(_.map(withdraws, async(i)=>{
                                            let user = await Model.User.findById(i.userIdRequest)
                                            return _.isEmpty(user) ? null : {...i._doc, userNameRequest: user?.displayName}
                                          }), i=>!_.isEmpty(i)))

      let suppliers = await Model.Supplier.find({}); 


      let users = await Model.User.find({})
      users = _.filter( await Promise.all(_.map(users, async(user)=>{
                if(_.isEqual(user._id, current_user?._id)) return null

                let roles = await Promise.all(_.map(user.roles, async(_id)=>{     
                  return (await Model.Role.findById({_id: mongoose.Types.ObjectId(_id)}))?.name
                }))            
                
                let newUser = {...user._doc, roles: _.filter(roles, (role)=>role!=undefined)};
                return _.omit(newUser, ['password']);
              })), i => !_.isEmpty(i))
              */

      let deposits = await Model.Transition.aggregate([
        { 
            $match: { status: Constants.WAIT /* 13 */, type: Constants.DEPOSIT /* 11 */ } 
        },
        {
            $lookup: {
                localField: "refId",
                from: "deposit",
                foreignField: "_id",
                as: "deposit"
            }
        },
        {
          $unwind: {
            "path": "$deposit",
            "preserveNullAndEmptyArrays": false
          }
        }
      ])

      let withdraws = await Model.Transition.aggregate([
        { 
            $match: { status: Constants.WAIT /* 13 */, type: Constants.WITHDRAW /* 11 */ } 
        },
        {
            $lookup: {
                localField: "refId",
                from: "withdraw",
                foreignField: "_id",
                as: "withdraw"
            }
        },
        {
          $unwind: {
            "path": "$withdraw",
            "preserveNullAndEmptyArrays": false
          }
        }
      ])

      let suppliers = Array.from({ length: await Utils.getTotalSupplier() }, (_, i) => i);

      let users = await Model.User.find({roles: {$nin:[Constants.AMDINISTRATOR]}}, 
                  { username: 1, email: 1, displayName: 1, banks: 1, roles: 1, avatar: 1, lastAccess: 1 }); 

      let data =  [ 
                    { title: "รายการ ฝากเงินรออนุมัติ", data: deposits },
                    { title: "รายการ ถอดเงินรออนุมัติ", data: withdraws }, 
                    { title: "รายการ สินค้าทั้งหมด", data: suppliers },
                    { title: "รายชื่อบุคคลทั้งหมด", data: users } 
                  ]
      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async adminBanks(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      await Utils.checkAuth(req);

      let data =  [ {label: '(xxx-x-xxxxx-01)ธนาคารไทยพาณิชย์', id: "bank-01" },
                    { label: '(xxx-x-xxxxx-02)ธนาคารกสิกรไทย', id: "bank-02" }]
      return {  status: true,
                data,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async adminDeposits(parent, args, context, info){
      let start = Date.now()
        
      let { req } = context
      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Constants.AMDINISTRATOR only!')

      // let transitions = await Model.Transition.find({ type: Constants.DEPOSIT, status: Constants.WAIT });

      // transitions = await Promise.all(_.map(transitions, async(transition)=>{
      //                       let deposit = await Model.Deposit.findOne({_id: transition?.refId})
      //                       let user    = await Utils.getUser({_id: transition?.userId}) 
      //                       return {...deposit?._doc, ...transition?._doc, user}
      //                     }))

      let transitions = await Model.Transition.aggregate([
        { 
            $match: { status: Constants.WAIT /* 13 */, type: Constants.DEPOSIT /* 11 */ } 
        },
        {
            $lookup: {
                localField: "refId",
                from: "deposit",
                foreignField: "_id",
                as: "deposit"
            }
        },
        {
          $unwind: {
            "path": "$deposit",
            "preserveNullAndEmptyArrays": false
          }
        }
      ])

      return {  status:true,
                data: transitions,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async adminWithdraws(parent, args, context, info){
      let start = Date.now()
        
      let { req } = context
      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Constants.AMDINISTRATOR only!')

      // let transitions = await Model.Transition.find({ type: Constants.WITHDRAW, status: Constants.WAIT });

      // transitions = await Promise.all(_.map(transitions, async(transition)=>{
      //                       let withdraw = await Model.Withdraw.findOne({_id: transition?.refId})
      //                       let user    = await Utils.getUser({_id: transition?.userId}) 
      //                       return {...withdraw?._doc, ...transition?._doc, user}
      //                     }))

      let transitions = await Model.Transition.aggregate([
        { 
            $match: { status: Constants.WAIT /* 13 */, type: Constants.WITHDRAW /* 11 */ } 
        },
        {
            $lookup: {
                localField: "refId",
                from: "withdraw",
                foreignField: "_id",
                as: "withdraw"
            }
        },
        {
          $unwind: {
            "path": "$withdraw",
            "preserveNullAndEmptyArrays": false
          }
        }
      ])

      return {  status:true,
                data: transitions,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },
  },
  Upload: GraphQLUpload,
  Mutation: {

    async login(parent, args, context, info) {
      let start = Date.now()
      let {input} = args

      let user = Utils.emailValidate().test(input.username) 
      if(Utils.emailValidate().test(input.username)){
        user = await Utils.getUser({email: input.username}, false)
        if( _.isNull(user) ){
          throw new AppError(Constants.USER_NOT_FOUND, 'USER NOT FOUND')
        }
        if(!_.isEqual(cryptojs.AES.decrypt(user?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8), input.password)){
          throw new AppError(Constants.PASSWORD_WRONG, 'PASSWORD WRONG')
        }
        user = await Utils.getUserFull({email: input.username})
      }else{
        user = await Utils.getUser({username: input.username}, false)
        if( _.isNull(user) ){
          throw new AppError(Constants.USER_NOT_FOUND, 'USER NOT FOUND')
        }
        if(!_.isEqual(cryptojs.AES.decrypt(user?.password, process.env.JWT_SECRET).toString(cryptojs.enc.Utf8), input.password)){
          throw new AppError(Constants.PASSWORD_WRONG, 'PASSWORD WRONG')
        }
        user = await Utils.getUserFull({username: input.username})
      }

      await Model.User.updateOne({ _id: user?._id }, { lastAccess : Date.now() });
      return {
        status: true,
        data: user,
        sessionId: await Utils.getSessionId(user?._id, input),
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

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

          let { data } = input

          let user = await Utils.getUser({socialId: data.profileObj.googleId, socialType: 'google'});
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
              roles: [/*'62a2ccfbcf7946010d3c74a4', '62a2ccfbcf7946010d3c74a6'*/ Constants.AUTHENTICATED ], // anonymous, authenticated
              isActive: 'active',
              banks: [],
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

            console.log("Presave GOOGLE :", newInput)
            
            user = await Model.User.create(newInput);
          }

          user = await Utils.getUserFull({_id: user?._id})
          console.log("getUserFull #GOOGLE :", user)
          return {
            status: true,
            data: user,
            sessionId: await Utils.getSessionId(user?._id, input),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "github":{
          let { data } = input

          let user = await Utils.getUserFull({socialId: data.code, socialType: 'github'});

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
            type : "Model.User"
            updated_at : "2022-11-14T09:16:18Z"
            url : "https://api.github.com/users/Base2526"
            */

            /*
            save data user
            
            input = {...input, displayName: input.username}
            return await Model.User.create(input);
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
            user = await Model.User.create(newInput);
          }

          console.log("GITHUB :", user)

          return {
            status:true,
            data: user,
            sessionId: await Utils.getSessionId(user?._id, input),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "facebook":{

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

          let user = await Utils.getUserFull({socialId: data.id, socialType: 'facebook'});

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
            user = await Model.User.create(newInput);

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

            await Model.User.findOneAndUpdate({ _id : user._id.toString()}, newInput, { new: true })

            console.log("FACEBOOK : update")
          }

          console.log("FACEBOOK :", user)
          return {
            status:true,
            data: user,
            sessionId: await Utils.getSessionId(user?._id, input),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(Constants.ERROR, 'Other case')
        }
      }
    },

    // https://github.com/PrincewillIroka/login-with-github/blob/master/server/index.js
    async loginWithGithub(parent, args, context, info){
      try{
        let start = Date.now()

        let { code } = args

        console.log("loginWithGithub :", args)

        const data = new FormData();
        data.append("client_id", process.env.GITHUB_CLIENT_ID);
        data.append("client_secret", process.env.GITHUB_CLIENT_SECRET);
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

    async register(parent, args, context, info) {
      let start = Date.now()
      let {input} = args

      let user = await Utils.getUser({ email: input.email } ) 
      if(!_.isNull(user)) throw new AppError(Constants.ERROR, "EXITING EMAIL")

      let newInput =  {...input,  password: cryptojs.AES.encrypt( input.password, process.env.JWT_SECRET).toString(),
                                  displayName: _.isEmpty(input.displayName) ? input.username : input.displayName ,
                                  roles: [Constants.AUTHENTICATED], 
                                  isActive: 'active', 
                                  lastAccess: Date.now(), 
                                  isOnline: true}
              
      await Model.User.create(newInput);
      return {
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async me(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context
      
      let { current_user } =  await Utils.checkAuth(req);

      let { type, mode, data } = input
      switch(type){
        case "bank":{
          switch(mode){
            case "new":{
              let { banks } = await Utils.getUser({_id: current_user?._id}) 
              await Model.User.updateOne({ _id: current_user?._id }, { banks: [...banks, ...data] } );
              break;
            }
    
            case "delete":{
              let { banks } = await Utils.getUser({_id: current_user?._id}) 
              let newBanks = _.filter(banks, (bank)=>!_.isEqual(bank?._id.toString(), data))
              await Model.User.updateOne({ _id: current_user?._id }, { banks: newBanks } );
              
              break;
            }
          }
          break;
        }

        case "avatar":{
          let fileObject = data?.file
  
          const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
          const stream = createReadStream();
          const assetUniqName = Utils.fileRenamer(filename);
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
  
          const urlForArray = `${process.env.RA_HOST}${assetUniqName}`
          await Model.User.updateOne({ _id: current_user?._id }, { avatar: { url: urlForArray, filename, encoding, mimetype } } );
        
          break;
        }
      }

      cache.ca_delete(current_user?._id.toString())

      let user = await Utils.getUserFull({_id: current_user?._id}) 
      pubsub.publish("ME", { me: { mutation: "UPDATE", data: user } });

      return {
        status: true,
        type,
        mode,
        data: user,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async book(parent, args, context, info) {
      let start = Date.now()
      let { input } = args        
      let { req } = context
      
      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      let { supplierId, itemId, selected } = input

      let supplier = await Utils.getSupplier({ _id: supplierId })
      if(_.isNull(supplier)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      let price       = supplier?.price
      let balance     = await Utils.getBalance(current_user?._id)
      let balanceBook = await Utils.getBalanceBook(current_user?._id)
      if(price > (balance - balanceBook)){
        console.log("book #[NOT_ENOUGH_BALANCE] : ", price, balance, balanceBook)
        throw new AppError(Constants.NOT_ENOUGH_BALANCE, 'NOT ENOUGH BALANCE')
      }

      cache.ca_delete(current_user?._id.toString())
      
      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        if(_.isNull(await Model.Transition.findOne({ refId: supplier?._id, userId: current_user?._id}))){
          await Model.Transition.create( { refId: supplier?._id, userId: current_user?._id } )
        }

        let { buys } = supplier
        if(selected == 0){
          let check =  _.find(buys, (buy)=> buy.itemId == itemId )
          if(check == undefined){

            await Utils.updateSupplier({ _id: supplierId }, {...supplier._doc, buys: [...buys, {userId: current_user?._id, itemId, selected}] })
              
            let newSupplier = await Utils.getSupplier({ _id: supplierId }) 

            // Case current open multi browser
            pubsub.publish("SUPPLIER_BY_ID", {
              supplierById: { mutation: "BOOK", data: newSupplier },
            });

            // Case other people open home page
            pubsub.publish("SUPPLIERS", {
              suppliers: { mutation: "BOOK", data: newSupplier },
            });

            let user = await Utils.getUserFull({_id: current_user?._id}) 

            pubsub.publish("ME", {
              me: { mutation: "BOOK", data: { userId: current_user?._id, data: user } },
            });

            // Commit the transaction
            await session.commitTransaction();

            return {
              status: true,
              action: {mode: "BOOK", itemId},
              data: newSupplier,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }
          throw new Error('ALREADY BOOK')
        }else{
          await Utils.updateSupplier({ _id: supplierId }, {...supplier._doc, buys: _.filter(buys, (buy)=> buy.itemId != itemId && buy.userId != current_user?._id ) })

          let newSupplier = await Utils.getSupplier({ _id: supplierId })
          
          pubsub.publish("SUPPLIER_BY_ID", {
            supplierById: { mutation: "UNBOOK", data: newSupplier },
          });

          pubsub.publish("SUPPLIERS", {
            suppliers: { mutation: "UNBOOK", data: newSupplier },
          });

          let user = await Utils.getUserFull({_id: current_user?._id }) 
          pubsub.publish("ME", {
              me: { mutation: "BOOK", data: { userId: current_user?._id, data: user } 
            },
          });

          // Commit the transaction
          await session.commitTransaction();

          return {
            status: true,
            action: {mode: "UNBOOK", itemId},
            data: newSupplier,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }  
      }catch(error){
        await session.abortTransaction();
        console.log(`book #error : ${error}`)
        
        throw new AppError(Constants.ERROR, error)
      } finally {
        session.endSession();
        console.log("book #finally")
      }
    },

    async buy(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      // let supplier = await Model.Supplier.findById(_id);
      // if(_.isNull(supplier)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      // let buys =  _.map(supplier.buys, (buy)=> buy.userId == current_user?._id.toString() ? {...buy._doc, selected: 1} : buy )
      // console.log(">>>> buy", buys)
      // await Model.Supplier.updateOne({ _id }, { buys });
      // let user = await Utils.getUser({_id: current_user?._id}) 
      // user =  { ...user, ...await checkBalance(current_user?._id) }
      // pubsub.publish("ME", {
      //   me: { mutation: "BUY", data: { userId: current_user?._id, data: user } },
      // });
      // 

      // let price       = supplier?.price
      // let balance     = await Utils.getBalance(current_user?._id)
      // let balanceBook = await Utils.getBalanceBook(current_user?._id)
      // if(price > (balance - balanceBook)){
      //   console.log("book #[NOT_ENOUGH_BALANCE] : ", price, balance, balanceBook)
      //   throw new AppError(Constants.NOT_ENOUGH_BALANCE, 'NOT ENOUGH BALANCE')
      // }

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        await Utils.updateSupplier({ _id }, { "$set": { "buys.$[].selected": 1 } }, { arrayFilters: [{ 'buys.$[].userId': current_user?._id }], timestamps: true })
        await Model.Transition.updateOne( { refId: _id, userId: current_user?._id }, { status: Constants.APPROVED } )
  
        // Commit the transaction
        await session.commitTransaction();

        let supplier = await Utils.getSupplier({ _id })
  
        // Case current open multi browser
        pubsub.publish("SUPPLIER_BY_ID", {
          supplierById: { mutation: "BOOK", data: supplier },
        });
  
        // Case other people open home page
        pubsub.publish("SUPPLIERS", {
          suppliers: { mutation: "BOOK", data: supplier },
        });
  
        let user = await Utils.getUserFull( {_id: current_user?._id} ) 
        pubsub.publish("ME", {
          me: { mutation: "BUY", data: { userId: current_user?._id, data: user } },
        });
  
        return {
          status: true,
          data: supplier,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }

      }catch(error){
        await session.abortTransaction();
        console.log(`buy #error : ${error}`)
        
        throw new AppError(Constants.SYSTEM_ERROR, error)
      } finally {
        session.endSession();
        console.log("buy #finally")
      }
    },

    async cancelTransition(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        let { n , nModified, ok } = await Utils.updateSuppliers({ _id }, { $pull: {buys: { userId: current_user?._id }} })
        if(ok){
          console.log("n , nModified, ok ::", n , nModified, ok)
          await Model.Transition.updateOne( { refId: _id }, {status: Constants.CANCEL} )

          cache.ca_delete(current_user?._id.toString())

          let user = await Utils.getUserFull({_id: current_user?._id}) 
          pubsub.publish("ME", { me: { mutation: "CANCEL", data: { userId: current_user?._id, data: user } } });

          let newSupplier = await Utils.getSupplier({ _id })

          pubsub.publish("SUPPLIERS", { suppliers: { mutation: "AUTO_CLEAR_BOOK", data: newSupplier } });

          return {
            status: true,
            data: newSupplier, 
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        // Commit the transaction
        await session.commitTransaction();
      }catch(error){
        await session.abortTransaction();
        console.log(`cancelTransition #error : ${error}`)
        
        throw new AppError(Constants.SYSTEM_ERROR, error)
      } finally {
        session.endSession();
        console.log("cancelTransition #finally")
      }

      return {
        status: false,
        message: "supplier not update",
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    // Add/Edit supplier
    async supplier(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      console.log("supplier :", input)

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR && Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated and Authenticated only!')

      if(input.test){
        let supplier = await Model.Supplier.create(input);
        return {
          status: true,
          mode: input.mode.toLowerCase(),
          data: supplier,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }

      switch(input.mode.toLowerCase()){
        case "new":{

          cache.ca_delete("length")

          let newFiles = [];
          if(!_.isEmpty(input.files)){
        
            for (let i = 0; i < input.files.length; i++) {
              const { createReadStream, filename, encoding, mimetype } = (await input.files[i]).file //await input.files[i];
  
              const stream = createReadStream();
              const assetUniqName = Utils.fileRenamer(filename);
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
          }

          let supplier = await Model.Supplier.create({ ...input, files:newFiles, ownerId: current_user?._id });
        
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: supplier,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "edit":{  
          cache.ca_delete(input._id)

          let newFiles = [];
          if(!_.isEmpty(input.files)){
  
            for (let i = 0; i < input.files.length; i++) {
              try{
                let fileObject = (await input.files[i]).file
  
                if(!_.isEmpty(fileObject)){
                  const { createReadStream, filename, encoding, mimetype } = fileObject //await input.files[i];
                  const stream = createReadStream();
                  const assetUniqName = Utils.fileRenamer(filename);
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

          await Utils.updateSupplier({ _id: input._id }, newInput )

          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: await Utils.getSupplier({ _id: input._id }),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(Constants.ERROR, 'Other case')
        }
      }
    },

    async deposit(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      const { createReadStream, filename, encoding, mimetype } = (await input.file).file

      const stream = createReadStream();
      const assetUniqName = Utils.fileRenamer(filename);
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

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        let deposit = await Model.Deposit.create({balance: input?.balance, 
                                          date: input?.date, 
                                          bankId: input?.bankId, 
                                          file: { url: `${process.env.RA_HOST}${assetUniqName}`, filename, encoding, mimetype }, 
                                          userIdRequest: current_user?._id })

        if(deposit?._id){
          await Model.Transition.create({
                                    type: Constants.DEPOSIT, 
                                    refId: deposit?._id, 
                                    userId: current_user?._id
                                  })
        }
    
        // Commit the transaction
        await session.commitTransaction();

        return {
          status: true,
          data: deposit,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error){
        await session.abortTransaction();
        console.log(`deposit #error : ${error}`)
        
        throw new AppError(Constants.SYSTEM_ERROR, error)
      } finally {
        session.endSession();
        console.log("deposit #finally")
      }
    },

    async withdraw(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        let withdraw = await Model.Withdraw.create({ ...input,  userIdRequest: current_user?._id });

        if(withdraw?._id){
          await Model.Transition.create({
                                    type: Constants.WITHDRAW, 
                                    refId: withdraw?._id, 
                                    userId: current_user?._id
                                  })
        }
    
        // Commit the transaction
        await session.commitTransaction();
        return {
          status: true,
          data: withdraw,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }catch(error){
        await session.abortTransaction();
        console.log(`deposit #error : ${error}`)
        
        throw new AppError(Constants.SYSTEM_ERROR, error)
      } finally {
        session.endSession();
        console.log("deposit #finally")
      }
    },

    async bank(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      switch(input.mode.toLowerCase()){
        case "new":{
          console.log("new bank : ", input, current_user, current_user?._id )

          let bank = await Model.Bank.create({ input });
          
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: bank,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "edit":{
          let { input } = args

          console.log("edit bank :", input)
  
          let bank = await Model.Bank.findOneAndUpdate({ _id: input._id }, input, { new: true });
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: bank,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(Constants.ERROR, 'Other case')
        }
      }
    },

    async follow(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      cache.ca_delete(_id)

      let supplier = await Utils.getSupplier({_id})
      if(_.isNull(supplier)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      let mode = "follow";

      let {follows} = supplier  
      if(!_.isEmpty(follows)){
        let isFollow = _.find(follows, (follow)=>_.isEqual(follow.userId, current_user?._id))
        if(_.isEmpty(isFollow)){
          follows = [...follows, {userId: current_user?._id}]
        }else{
          follows = _.filter(follows, (follow)=>!_.isEqual(follow.userId, current_user?._id))

          mode = "unfollow";
        }
      }else{
        follows = [{userId: current_user?._id}]
      }

      await Utils.updateSupplier({ _id }, { follows });
      
      return {
        status: true,
        mode,
        data: await Utils.getSupplier({_id}),
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async datesLottery(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);

      if( !_.isEqual(Utils.checkRole(current_user), Constants.AMDINISTRATOR) ) throw new AppError(Constants.UNAUTHENTICATED, 'Constants.AMDINISTRATOR only!')

      await Promise.all( _.map(input, async(date, weight)=>{
                          let dateLottery =  await Model.DateLottery.findOne({date})
                          _.isEmpty(dateLottery) ? await Model.DateLottery.create({ date, weight }) : await dateLottery.updateOne({ weight })
                        }))

      let dateLottery = await Model.DateLottery.find({})
      dateLottery = _.filter( await Promise.all( _.map(dateLottery, async(i)=>{
        let suppliers = await Utils.getSupplier({ dateLottery: i?._id }) 
        return _.isEmpty(suppliers) ?  null : {...i?._doc, suppliers }
      })), i => !_.isNull(i))

      return {
        status: true,
        data: dateLottery,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }

      /*
      switch(input.mode.toLowerCase()){
        case "new":{
          input = {...input, weight: 1}

          console.log("input : ", input )

          let dateLottery = await Model.DateLottery.create(input);
          
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: dateLottery,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "edit":{
          let { input } = args

          console.log("edit dateLottery : ", input)
  
          let dateLottery = await Model.DateLottery.findOneAndUpdate({ _id: input._id }, input, { new: true });
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: dateLottery,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(Constants.ERROR, 'Other case')
        }
      }
      */
    },

    async notification(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      console.log("notification :", _id)

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      // let supplier = await Model.Supplier.findOne({_id})
      // if(_.isNull(supplier)) throw new AppError(Constants.DATA_NOT_FOUND, 'Data not found.')

      // let {follows} = supplier  
      // if(!_.isEmpty(follows)){
      //   let isFollow = _.find(follows, (follow)=>_.isEqual(follow.userId, current_user?._id))
      //   if(_.isEmpty(isFollow)){
      //     follows = [...follows, {userId: current_user?._id}]
      //   }else{
      //     follows = _.filter(follows, (follow)=>!_.isEqual(follow.userId, current_user?._id))
      //   }
      // }else{
      //   follows = [{userId: current_user?._id}]
      // }

      // await Model.Supplier.updateOne( { _id }, { follows } );
      // supplier = await Model.Supplier.findOne({_id})
      
      return {
        status: true,
        // data: {...supplier._doc, owner: (await Model.User.findById(supplier.ownerId))?._doc },
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async comment(parent, args, context, info) {
      let start = Date.now()
      let { req } = context
      let { input } = args

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      let comment = await Model.Comment.findOne({ _id: input?._id })

      if(_.isNull(comment)){
        comment = await Model.Comment.create(input);
        pubsub.publish("COMMENT_BY_ID", {
          commentById: {
            mutation: "CREATED",
            commentId: comment?._id,
            data: comment,
          },
        });
      }else{
        await Model.Comment.updateOne({ _id: input?._id }, input );
        comment = await Model.Comment.findOne({ _id: input?._id })
        pubsub.publish("COMMENT_BY_ID", {
          commentById: {
            mutation: "UPDATED",
            commentId: comment?._id,
            data: comment,
          },
        });
      }
      
      return {
        status:true,
        commentId: comment?._id,
        data: comment,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async contactUs(parent, args, context, info){
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      // if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR && Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      let newFiles = [];
      if(!_.isEmpty(input.files)){
        for (let i = 0; i < input.files.length; i++) {
          const { createReadStream, filename, encoding, mimetype } = (await input.files[i]).file //await input.files[i];

          const stream = createReadStream();
          const assetUniqName = Utils.fileRenamer(filename);
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
      }

      let contactUs = await Model.ContactUs.create({ ...input, files:newFiles });
    
      return {
        status: true,
        data: contactUs,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async subscribe(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AUTHENTICATED ) throw new AppError(Constants.UNAUTHENTICATED, 'Authenticated only!')

      let { subscriber } = await Utils.getUserFull({ _id })
      if( _.find(subscriber, (item)=> _.isEqual(item.userId, current_user?._id)) ) {
        await Model.User.updateOne({ _id }, { subscriber: _.filter(subscriber, (item)=> !_.isEqual(item.userId, current_user?._id)) })
      }else{
        await Model.User.updateOne({ _id }, { subscriber: [...subscriber, {userId: current_user?._id}] })
      }
      return {
        status: true,
        data: await Utils.getUserFull({ _id }),
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }      
    },

    async adminDeposit(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'AMDINISTRATOR only!')

      let transition = await Model.Transition.findOne({ _id: input?._id })

      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        await Model.Transition.updateOne({ _id: input?._id }, { status : input?.status });

        // Commit the transaction
        await session.commitTransaction();
      }catch(error){
        await session.abortTransaction();
        
        throw new AppError(Constants.SYSTEM_ERROR, error);
      } finally {
        session.endSession();
      }

      cache.ca_delete( transition?.userId.toString() )
      if(_.isEqual(input?.status, Constants.APPROVED)){
        let user = await Utils.getUserFull({_id: transition?.userId}) 

        pubsub.publish("ME", { me: { mutation: "DEPOSIT", data: {userId: transition?.userId , data: user } } });
      }

      return {
        status: true,
        mode: input?.status,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }      
    },

    async adminWithdraw(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await Utils.checkAuth(req);
      if( Utils.checkRole(current_user) != Constants.AMDINISTRATOR ) throw new AppError(Constants.UNAUTHENTICATED, 'Constants.AMDINISTRATOR only!')

      let transition = await Model.Transition.findOne({ _id: input?._id })
      
      const session = await mongoose.startSession();
      // Start the transaction
      session.startTransaction()
      try {
        await Model.Transition.updateOne({ _id: input?._id }, { status : input?.status });

        // Commit the transaction
        await session.commitTransaction();
      }catch(error){
        await session.abortTransaction();
        
        throw new AppError(Constants.SYSTEM_ERROR, error);
      } finally {
        session.endSession();
      }

      if(_.isEqual(input?.status, Constants.APPROVED)){
        let user = await Utils.getUserFull({_id: transition?.userId}) 
        pubsub.publish("ME", { me: { mutation: "DEPOSIT", data: {userId: transition?.userId , data: user } } });
      }

      return {
        status: true,
        mode: input?.status,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }      
    },

    async testNodeCacheSave(parent, args, context, info) {
      
      // let __set = cache.ca_set("a", {a: "a", b: "b"}) 
      // let __get = cache.ca_get("a");
      // console.log("testNodeCache :", __set, __get)

      let v = {
                  "myKeyA": { my: "Special", variable: 123 },
                  "myKeyB": { the: "Glory", answer: 42 }
              }

      // let get = cache.ca_get("A")

      // console.log("get :", get)

      let save = cache.ca_save("A", v)

      // _.map(cache.ca_keys(), (key, i)=>{
      //   console.log("==> ", cache.ca_get(key))
      // })
      console.log("save :", save)

      return {
        status: true,
        executionTime: `seconds`
      }   
    },

    async testNodeCacheGet(parent, args, context, info) {
      // let __set = cache.ca_set("a", {a: "a", b: "b"}) 
      // let __get = cache.ca_get("a");
      // console.log("testNodeCache :", __set, __get)

      // let v = {
      //             "myKeyA": { my: "Special", variable: 123 },
      //             "myKeyB": { the: "Glory", answer: 42 }
      //         }

      let get = cache.ca_get("A")

      console.log("get :", get, _.isEmpty(get))
      // let save = cache.ca_save("A", v)
      // _.map(cache.ca_keys(), (key, i)=>{
      //   console.log("==> ", cache.ca_get(key))
      // })
      // console.log("save :", save)

      return {
        status: true,
        executionTime: `seconds`
      }   
    },

    async testNodeCacheDelete(parent, args, context, info) {
      // let __set = cache.ca_set("a", {a: "a", b: "b"}) 
      // let __get = cache.ca_get("a");
      // console.log("testNodeCache :", __set, __get)
      // let v = {
      //             "myKeyA": { my: "Special", variable: 123 },
      //             "myKeyB": { the: "Glory", answer: 42 }
      //         }

      let ca_delete = cache.ca_delete("A")
      if(ca_delete){
        console.log("ca_delete :", ca_delete)
      }

      // console.log("ca_delete :", ca_delete)

      // let save = cache.ca_save("A", v)

      // _.map(cache.ca_keys(), (key, i)=>{
      //   console.log("==> ", cache.ca_get(key))
      // })
      // console.log("save :", save)

      return {
        status: true,
        executionTime: `seconds`
      }   
    }
  },
  Subscription:{
    subscriptionMe: {
      resolve: (payload) =>{
        return payload.me
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["ME"])
        }, async(payload, variables) => {
          try{

            let { sessionId } = variables
            if(_.isEmpty(sessionId)){
              return false;
            }

            let {mutation, data} = payload.me

            // userId
            let authorization = await Utils.checkAuthorizationWithSessionId(sessionId);
            let { status, code, current_user } =  authorization

            switch(mutation){
              case "DEPOSIT":
              case "WITHDRAW":
              case "BOOK":
              case "BUY":
              case "CANCEL":{
                return _.isEqual(data?.userId, current_user?._id) ? true : false;
              }

              case "UPDATE":{
                return _.isEqual(data?._id, current_user?._id) ? true : false;
              }
            }

            console.log( "Subscription : ME ", data?.userId, current_user?._id, _.isEqual(data?.userId, current_user?._id) )  

            return false;
          } catch(err) {
            console.log("Subscription : ME #Constants.ERROR =", err.toString())           
            return false;
          }
        }
      )
    },
    subscriptionSupplierById: {
      resolve: (payload) =>{
        return payload.supplierById
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["SUPPLIER_BY_ID"])
        }, (payload, variables) => {

          let {mutation, data} = payload.supplierById

          console.log("subscriptionSupplierById : ", mutation, variables?._id == data?._id)
          switch(mutation){
            case "BOOK":
            case "UNBOOK":
            case "AUTO_CLEAR_BOOK":
              {
                return variables?._id == data?._id
              }
          }
          return false;
        }
      )
    },
    subscriptionSuppliers: {
      resolve: (payload) =>{
        return payload.suppliers
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["SUPPLIERS"])
        }, (payload, variables) => {

          console.log("subscriptionSuppliers")

          let {mutation, data} = payload.suppliers

          switch(mutation){
            case "BOOK":
            case "UNBOOK":
            case "AUTO_CLEAR_BOOK":
              {
                return _.includes(JSON.parse(variables.supplierIds), data._id.toString())
              }
          }

          return false;
        }
      )
    },
    subscriptionAdmin: {
      resolve: (payload) =>{
        return payload.admin
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["ADMIN"])
        }, (payload, variables) => {

          console.log("subscriptionAdmin")

          let {mutation, data} = payload.admin

          // switch(mutation){
          //   case "BOOK":
          //   case "UNBOOK":
          //   case "AUTO_CLEAR_BOOK":
          //     {
          //       return _.includes(JSON.parse(variables.supplierIds), data._id.toString())
          //     }
          // }

          return true;
        }
      )
    },
    subscriptionCommentById: {
      resolve: (payload) =>{
        return payload.commentById 
      },
      subscribe: withFilter((parent, args, context, info) => {
          return pubsub.asyncIterator(["COMMENT_BY_ID"])
        }, (payload, variables) => {

          let {mutation, commentId, data} = payload?.commentById

          // console.log("COMMENT_BY_ID : ", mutation, commentId, variables )
          switch(mutation){
            case "CREATED":
            case "UPDATED":
              return variables?._id == commentId
            default:
              return false;
          }
        }
      )
    },
  },
}