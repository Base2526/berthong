import { withFilter } from 'graphql-subscriptions';
import _ from "lodash";
import FormData from "form-data";
import cryptojs from "crypto-js";
import deepdash from "deepdash";
deepdash(_);
import * as fs from "fs";
import { __TypeKind } from 'graphql';
import mongoose from 'mongoose';
import { User, Supplier, Bank, Role, Deposit, Withdraw, DateLottery, Transition } from './model'
import pubsub from './pubsub'
import { emailValidate, checkBalance, checkBalanceBook, fileRenamer, 
        checkAuthorization, checkAuthorizationWithSessionId, getSessionId, checkRole} from "./utils"
import { SUCCESS, ERROR, FORCE_LOGOUT, DATA_NOT_FOUND, USER_NOT_FOUND, UNAUTHENTICATED, AMDINISTRATOR, AUTHENTICATED } from "./constants"
import AppError from "./utils/AppError"
import fetch from "node-fetch";
import { GraphQLUpload } from 'graphql-upload';
import logger from "./utils/logger";

export default {
  Query: {
    async ping(parent, args, context, info){
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      //  return (await Role.findById({_id: mongoose.Types.ObjectId(_id)}))?.name

      // let user = await User.findById(mongoose.Types.ObjectId("62a2f65dcf7946010d3c7515"))
      // console.log("ping user :", user, _.isNull(user))

      // let suppliers = await Supplier.findOne({_id: mongoose.Types.ObjectId("63f5c99fee4cff016c214fa3")})

      // console.log("ping suppliers :", suppliers)

      if(status && code == 1){
        console.log("ping ok : ", current_user?._id)
      }else{
        console.log("ping other")
      }

      return { status:true }
    },

    async me(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')
      if(!status && code == USER_NOT_FOUND) throw new AppError(USER_NOT_FOUND, 'User not found.')

      let user = await User.findById(current_user?._id)
      if(_.isNull(user)) throw new AppError(USER_NOT_FOUND, 'User not found.')

      user =_.omit( { ...user._doc, 
                      balance: (await checkBalance(current_user?._id)).balance,
                      balanceBook: await checkBalanceBook(current_user?._id)}, ["password", "__v"])

      return {  status: true,
                data: user,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
              }
    },

    async users(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')
      if( checkRole(current_user) != AMDINISTRATOR ) throw new AppError(UNAUTHENTICATED, 'Admin only!')

      let users = await User.find({})

      users = await Promise.all(_.map(users, async(user)=>{
                let roles = await Promise.all(_.map(user.roles, async(_id)=>{     
                  return (await Role.findById({_id: mongoose.Types.ObjectId(_id)}))?.name
                }))            
                
                let newUser = {...user._doc, roles: _.filter(roles, (role)=>role!=undefined)};
                return _.omit(newUser, ['password']);
              }))

      return { 
              status:true,
              data: users,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
              }
    },

    async userById(parent, args, context, info){
      let start = Date.now()
      
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')
      if( checkRole(current_user) != AMDINISTRATOR ) throw new AppError(UNAUTHENTICATED, 'Admin only!')

      let user = await User.findById(_id)
      if(_.isNull(user)) throw new AppError(USER_NOT_FOUND, 'User not found.')

      return {  status: true,
                data: user,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async roles(parent, args, context, info) {
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')
      if( checkRole(current_user) != AMDINISTRATOR ) throw new AppError(UNAUTHENTICATED, 'Admin only!')

      let data = await Role.find();
      if(_.isNull(data)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      return {
        status:true,
        data,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async suppliers(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      let { status, code, pathname, current_user } = await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')
      
      switch(pathname){
        case undefined:
        case "/":{
          let suppliers = await Supplier.find({}).limit(20);
          suppliers = await Promise.all(_.map(suppliers, async(item)=>{
            let user = await User.findById(item.ownerId);
            if(_.isNull(user)) return null;
            return {...item._doc,  owner: user?._doc }
          }).filter(i=>!_.isNull(i)))

          return {  
            status: true,
            data: suppliers,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
          }
        }

        default:{
          if( checkRole(current_user) == AMDINISTRATOR ){
            let suppliers = await Supplier.find({});
            suppliers = await Promise.all(_.map(suppliers, async(item)=>{
                          let user = await User.findById(item.ownerId);
                          if(_.isNull(user)) return null;
                          return {...item._doc,  owner: user?._doc }
                        }).filter(i=>!_.isNull(i)))

            return {  status: true,
                      data: suppliers,
                      executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
          }

          let suppliers = await Supplier.find({ownerId: current_user?._id});
          suppliers = await Promise.all(_.map(suppliers, async(item)=>{
                        let user = await User.findById(item.ownerId);
                        if(_.isNull(user)) return null;
                        return {...item._doc,  owner: user?._doc }
                      }).filter(i=>!_.isNull(i)))

          return {  
            status: true,
            data: suppliers,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` 
          }
        }
      }
    },

    async supplierById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let supplier = await Supplier.findById(_id)
      if(_.isNull(supplier)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      return {  status:true,
                data: supplier,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async deposits(parent, args, context, info){
      let start = Date.now()
        
      let { req } = context
      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      if( checkRole(current_user) == AMDINISTRATOR ){

        let deposits = await Deposit.find({status: "wait"})
        deposits = _.orderBy(deposits, i => i.updatedAt, 'desc');

        return {  status: true,
                  data: deposits,
                  executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      }

      let deposits = await Deposit.find({userIdRequest: current_user?._id})

      deposits = _.orderBy(deposits, i => i.updatedAt, 'desc');
      return {  status:true,
                data: deposits,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async depositById(parent, args, context, info){
      let start = Date.now()

      let { _id } = args
      let { req } = context
      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      return {  status:true,
                data: await Deposit.findById(_id),
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async withdraws(parent, args, context, info){
      let start = Date.now()
      let { req } = context
      try{
        let { status, code, pathname, current_user } =  await checkAuthorization(req);
        if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

        if( checkRole(current_user) != AMDINISTRATOR && 
            checkRole(current_user) != AUTHENTICATED ) throw new AppError(UNAUTHENTICATED, 'Admin or Authenticated only!')

        if( checkRole(current_user) == AMDINISTRATOR ){
          let withdraws = await Withdraw.find({status: "wait"})

          withdraws = await Promise.all(_.map(withdraws, async(i)=>{
                                                let user = await User.findById(i.userIdRequest)
                                                return _.isEmpty(user) ? null : {...i._doc, userNameRequest: user?.displayName}
                                              }).filter(i=>!_.isNull(i)))
          return {  status: true,
                    data: _.orderBy(withdraws, i => i.updatedAt, 'desc'),
                    executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
        }

        let withdraws = await Withdraw.find({userIdRequest: current_user?._id})
        withdraws = await Promise.all(_.map(withdraws, async(item)=>{
                                              let user = await User.findById(item.userIdApprove)
                                              return {...item._doc, userNameApprove: user?.displayName}
                                            }))

        return {  status: true,
                  data: _.orderBy(withdraws, i => i.updatedAt, 'desc'),
                  executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      }catch(error){
        return {  status: false,
          data: error.toString(),
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
      }
    },

    async withdrawById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let withdraw = await Withdraw.findById(_id)
      if(_.isNull(withdraw)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      let bank = withdraw.bank[0];
      let bankValue = await Bank.findById(bank.bankId)
      if(_.isNull(bankValue)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      bank = {...bank._doc, bankName: bankValue.name}

      return {  status:true,
                  data: {...withdraw._doc, bank: [bank]},
                  executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async banks(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let banks = await Bank.find({})
      if(_.isNull(banks)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      return {  status: true,
                data: banks,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async bankById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let bank = await Bank.findById(_id)
      if(_.isNull(bank)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      return {  status:true,
                data: bank,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }
    },

    async bankAdmin(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let userAdmin  = await User.findById(mongoose.Types.ObjectId("62a2c0cecf7946010d3c743f"))
      if(_.isNull(userAdmin)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      let banks = await Bank.find({})
      if(_.isNull(banks)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      return {  status: true,
                admin_banks: userAdmin?.banks,
                banks: banks,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async bookBuyTransitions(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let transitions = await Transition.find({userId: current_user?._id, type: "supplier",status:"success" });
      transitions = _.filter( await Promise.all(_.map(transitions, async(transition)=>{
                      let supplier = await Supplier.findById(transition.refId)

                      let { buys } = supplier
                      let book  = _.filter(buys, buy=> _.isEqual(buy.userId, current_user?._id)  && buy.selected == 0)
                      let buy  = _.filter(buys, buy=>_.isEqual(buy.userId, current_user?._id)  && buy.selected == 1)

                      return book.length > 0 || buy.length > 0 ? {...transition._doc, ...supplier._doc } : null
                    })), item=>!_.isNull(item) ) 

      return {  status: true,
                data: transitions,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async historyTransitions(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      return {  status: true,
                data: (await checkBalance(current_user?._id)).transitions,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async supplierProfile(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let user = await User.findById(_id);
      if(_.isNull(user)) throw new AppError(USER_NOT_FOUND, 'User not found.')

      let suppliers = await Supplier.find({ownerId: _id});
      if(_.isNull(suppliers)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      return {  status: true,
                data: {...user._doc, suppliers},
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async dateLotterys(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let dateLotterys = await DateLottery.find({})
      if(_.isNull(dateLotterys)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')
      
      return {  status: true,
                data: dateLotterys,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async dateLotteryById(parent, args, context, info){
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let dateLottery = await DateLottery.findById(_id)
      if(_.isNull(dateLottery)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      return {  status: true,
                data: dateLottery,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds` }

    },

    async buys(parent, args, context, info){
      let start = Date.now()
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if( !status && code == FORCE_LOGOUT ) throw new AppError(FORCE_LOGOUT, 'Expired!')
      // if( checkRole(current_user) != AUTHENTICATED ) throw new AppError(UNAUTHENTICATED, 'Authenticated only!')

      let transitions = await Transition.find({userId: current_user?._id, type: "supplier", status:"success" });
      transitions = await Promise.all(_.map(transitions, async(transition)=>{
                          switch(transition.type){ // 'supplier', 'deposit', 'withdraw'
                            case "supplier":{

                              let supplier = await Supplier.findById(transition.refId)

                              let buys = _.filter(supplier.buys, (buy)=>buy.userId == current_user?._id.toString())
                              // price, buys

                              let balance = buys.length * supplier.price

                              console.log("transitions > supplier :", supplier)

                              return {...transition._doc, title: supplier.title, balance, description: supplier.description, dateLottery: supplier.dateLottery}
                            }
                          }
                      }))
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

      // throw new AppError(USER_NOT_FOUND, 'User not found.')

      console.log("params login : ", input)

      let user = emailValidate().test(input.username) ?  await User.findOne({email: input.username}) : await User.findOne({username: input.username})
      
      if(_.isNull(user)) throw new AppError(USER_NOT_FOUND, 'User not found.')

      await User.updateOne({ _id: user?._id }, { lastAccess : Date.now() });
      user = await User.findById(user?._id)

      user = {...user._doc, 
              balance: (await checkBalance(user?._id)).balance,
              balanceBook: await checkBalanceBook(user?._id)}

      return {
        status: true,
        data: _.omit(user, ["password", "__v"]),
        sessionId: await getSessionId(user?._id, input),
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

          return {
            status:true,
            data: user,
            sessionId: await getSessionId(user?._id, input),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "github":{
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

          return {
            status:true,
            data: user,
            sessionId: await getSessionId(user?._id, input),
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
          return {
            status:true,
            data: user,
            sessionId: await getSessionId(user?._id, input),
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(ERROR, 'Other case')
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

    async me(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) return { status: false, code: FORCE_LOGOUT}

      // image
      let newFiles = [];
      if(!_.isEmpty(input.image)){

        for (let i = 0; i < input.image.length; i++) {
          try{
            let fileObject = (await input.image[i]).file

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
              if(input.image[i].delete){
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
                newFiles = [...newFiles, input.image[i]]
              }
            }
            // console.log("updatePost #6:", newFiles)
          } catch(err) {
            logger.error(err.toString());
          }
        }
      }

      let newInput = {...input, image:newFiles, lastAccess : Date.now()}

      if( checkRole(current_user) == AMDINISTRATOR ){
        let user = await User.findOneAndUpdate({ _id: input.uid }, newInput , { new: true })
        let roles = await Promise.all(_.map(user.roles, async(_id)=>{     
          return (await Role.findById({_id: mongoose.Types.ObjectId(_id)}))?.name
        }))  
        user = {...user._doc, roles}
        user = _.omit(user, ['password'])

        pubsub.publish("ME", {
          me: { mutation: "UPDATE", data: user },
        });

        return {
          status: true,
          data: user,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }else{
        let user = await User.findOneAndUpdate({ _id: current_user?._id }, newInput , { new: true })
        let roles = await Promise.all(_.map(user.roles, async(_id)=>{     
          return (await Role.findById({_id: mongoose.Types.ObjectId(_id)}))?.name
        }))  
        user = {...user._doc, roles}
        user = _.omit(user, ['password'])

        pubsub.publish("ME", {
          me: { mutation: "UPDATE", data: user },
        });

        return {
          status: true,
          data: user,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },

    async book(parent, args, context, info) {
      let start = Date.now()
      let { input } = args        
      let { req } = context
      
      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')
      if( checkRole(current_user) != AUTHENTICATED ) throw new AppError(UNAUTHENTICATED, 'Authenticated only!')

      let { supplierId, itemId, selected } = input
      let supplier = await Supplier.findById(supplierId);

      if(_.isNull(supplier)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      if(_.isNull(await Transition.findOne({ refId: supplier?._id, userId: current_user?._id}))){
        await Transition.create( {type: "supplier", refId: supplier?._id, userId: current_user?._id, status: "success"} )
      }

      let { buys } = supplier
      if(selected == 0){
        let check =  _.find(buys, (buy)=> buy.itemId == itemId )
        if(check == undefined){
          await Supplier.updateOne(
                                { _id: supplierId }, 
                                {...supplier._doc, buys: [...buys, {userId: current_user?._id, itemId, selected}] } );
            
          let newSupplier = await Supplier.findById(supplierId)
          pubsub.publish("SUPPLIER_BY_ID", {
            supplierById: { mutation: "BOOK", data: newSupplier },
          });

          pubsub.publish("SUPPLIERS", {
            suppliers: { mutation: "BOOK", data: newSupplier },
          });

          pubsub.publish("ME", {
            me: { mutation: "BOOK", data: {userId: current_user?._id, data: { balance: (await checkBalance(current_user?._id)).balance , balanceBook: await checkBalanceBook(current_user?._id) } } },
          });

          return {
            status: true,
            action: {mode: "BOOK", itemId},
            data: newSupplier,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }
        throw new AppError(ERROR, 'Already book!')
      }else{
        await Supplier.updateOne(
        { _id: supplierId }, 
        {...supplier._doc, buys: _.filter(buys, (buy)=> buy.itemId != itemId && buy.userId != current_user?._id ) },  );

        let newSupplier = await Supplier.findById(supplierId)
        pubsub.publish("SUPPLIER_BY_ID", {
          supplierById: { mutation: "UNBOOK", data: newSupplier },
        });

        pubsub.publish("SUPPLIERS", {
          suppliers: { mutation: "UNBOOK", data: newSupplier },
        });

        pubsub.publish("ME", {
          me: { mutation: "BOOK", data: {userId: current_user?._id, data: { balance: (await checkBalance(current_user?._id)).balance, balanceBook: await checkBalanceBook(current_user?._id) } } },
        });

        return {
          status: true,
          action: {mode: "UNBOOK", itemId},
          data: newSupplier,
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }          
    },

    async buy(parent, args, context, info) {
      let start = Date.now()
      let {_id} = args
      let { req } = context
      
      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if( !status && code == FORCE_LOGOUT ) throw new AppError(FORCE_LOGOUT, 'Expired!')
      if( checkRole(current_user) != AUTHENTICATED ) throw new AppError(UNAUTHENTICATED, 'Authenticated only!')

      let supplier = await Supplier.findById(_id);
      if(_.isNull(supplier)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      let buys =  _.map(supplier.buys, (buy)=> buy.userId == current_user?._id.toString() ? {...buy._doc, selected: 1} : buy )
      await Supplier.updateOne({ _id }, {buys });

      pubsub.publish("ME", {
        me: { mutation: "BUY", data: {userId: current_user?._id, data: {...await checkBalance(current_user?._id), balanceBook: await checkBalanceBook(current_user?._id) }  } },
      });

      return {
        status: true,
        executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
      }
    },

    async supplier(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')
      if( checkRole(current_user) != AUTHENTICATED ) throw new AppError(UNAUTHENTICATED, 'Authenticated only!')

      switch(input.mode.toLowerCase()){
        case "new":{
          console.log("createSupplier : ", input, current_user, current_user?._id )

          let newFiles = [];
          if(!input.auto){
            if(!_.isEmpty(input.files)){
          
              for (let i = 0; i < input.files.length; i++) {
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
            }

            let supplier = await Supplier.create({ ...input, files:newFiles, ownerId: current_user?._id });
          
            return {
              status: true,
              mode: input.mode.toLowerCase(),
              data: supplier,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }else{
            let supplier = await Supplier.create({ ...input, ownerId: current_user?._id });
            return {
              status: true,
              mode: input.mode.toLowerCase(),
              data: supplier,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }
          
          
          
          
        }

        case "edit":{
          let { input } = args

          console.log("updateSupplier :", input)
  
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
          let supplier = await Supplier.findOneAndUpdate({ _id: input._id }, newInput, { new: true });

          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: supplier,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(ERROR, 'Other case')
        }
      }
    },

    async deposit(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      switch(input.mode.toLowerCase()){
        case "new":{
          console.log("new deposit : ", input, current_user, current_user?._id )

          
          let newFiles = [];
          if(!_.isEmpty(input.files)){
            for (let i = 0; i < input.files.length; i++) {
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
          }
          let deposit = await Deposit.create({ ...input, files:newFiles, userIdRequest: current_user?._id });
          
          /*
          balance: { type: Number, default: 0 },
          dateTranfer : { type : Date, default: Date.now },
          userIdRequest: { type: Schema.Types.ObjectId, required:[true, "User-Id Request is a required field"] },
          userIdApprove: { type: Schema.Types.ObjectId },
          files: [File],
          status:{
              type: String,
              enum : ['wait','approved', 'reject'],
              default: 'wait'
          }, 
          */

          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: deposit,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "edit":{
          let { input } = args

          console.log("edit deposit :", input)
          
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
          if(_.includes(['approved', 'reject'], newInput.status)){
            if( checkRole(current_user) == AMDINISTRATOR ){

              newInput = {...input, userIdApprove: current_user?._id}
              
              let deposit = await Deposit.findOneAndUpdate({ _id: input._id }, newInput, { new: true });

              if(input.status == "approved"){
                await Transition.create({
                                          type: "deposit", 
                                          refId: deposit?._id, 
                                          userId: deposit.userIdRequest, 
                                          status: "success"
                                        })

                pubsub.publish("ME", {
                  me: { mutation: "DEPOSIT", data: {userId: deposit.userIdRequest, data: await checkBalance(deposit.userIdRequest) } },
                });
              }

              return {
                status: true,
                mode: input.mode.toLowerCase(),
                data: deposit,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
              }
            }else{
              return {
                status: false,
                mode: input.mode.toLowerCase(),
                message: "Cannot approve & reject",
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
              }
            }
          }


          let deposit = await Deposit.findOneAndUpdate({ _id: input._id }, newInput, { new: true });
          

          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: deposit,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "delete":{
          let deposit = await Deposit.findByIdAndRemove({_id: input._id})
          console.log("delete deposit : ", input, deposit )
          if(_.isEmpty(deposit)){
            return {
              status: false,
              data: `error : cannot delete : ${ input._id }`,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: deposit,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(ERROR, 'Other case')
        }
      }
    },

    async withdraw(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      switch(input.mode.toLowerCase()){
        case "new":{
          console.log("new withdraw : ", input )

          let withdraw = await Withdraw.create({ ...input, userIdRequest: current_user?._id });
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: withdraw,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "edit":{
          console.log("edit withdraw :", input)

          if(_.includes(['approved', 'reject'], input.status)){
            if( checkRole(current_user) == AMDINISTRATOR ){
              let newInput = {...input, userIdApprove: current_user?._id}
              let withdraw = await Withdraw.findOneAndUpdate({ _id: input._id }, newInput, { new: true });

              if(input.status == "approved"){
                await Transition.create({
                                          type: "withdraw", 
                                          refId: withdraw?._id, 
                                          userId: withdraw.userIdRequest, 
                                          status: "success"
                                        })

                pubsub.publish("ME", {
                  me: { mutation: "WITHDRAW", data: {userId: withdraw.userIdRequest, data: await checkBalance(withdraw.userIdRequest) } },
                });
              }

              return {
                status: true,
                mode: input.mode.toLowerCase(),
                data: withdraw,
                // transition,
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
              }


              return {
                status: false,
                mode: input.mode.toLowerCase(),
                message: "Cannot approve & reject",
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
              }
            }else{
              return {
                status: false,
                mode: input.mode.toLowerCase(),
                message: "Cannot approve & reject",
                executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
              }
            }
          }

          let withdraw = await Withdraw.findOneAndUpdate({ _id: input._id }, input, { new: true });

          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: withdraw,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        case "delete":{
          let withdraw = await Withdraw.findByIdAndRemove({_id: input._id})
          console.log("delete deposit : ", input, withdraw )
          if(_.isEmpty(withdraw)){
            return {
              status: false,
              data: `error : cannot delete : ${ input._id }`,
              executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
            }
          }
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: withdraw,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(ERROR, 'Other case')
        }
      }
    },

    async bank(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      switch(input.mode.toLowerCase()){
        case "new":{
          console.log("new bank : ", input, current_user, current_user?._id )

          let bank = await Bank.create({ input });
          
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
  
          let bank = await Bank.findOneAndUpdate({ _id: input._id }, input, { new: true });
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: bank,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(ERROR, 'Other case')
        }
      }
    },

    async follow(parent, args, context, info) {
      let start = Date.now()
      let { _id } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      let suppliers = await Supplier.findOne({_id})
      if(_.isNull(suppliers)) throw new AppError(DATA_NOT_FOUND, 'Data not found.')

      if(suppliers){
        let {follows} = suppliers  
        if(!_.isEmpty(follows)){
          let isFollow = _.find(follows, (follow)=>follow.userId == current_user?._id.toString())
          if(_.isEmpty(isFollow)){
            follows = [...follows, {userId: current_user?._id}]
          }else{
            follows = _.filter(follows, (follow)=>follow.userId != current_user?._id.toString())
          }
        }else{
          follows = [{userId: current_user?._id}]
        }

        await Supplier.updateOne( { _id }, { follows } );
        return {
          status: true,
          data: {...suppliers._doc, ownerName: (await User.findById(suppliers.ownerId))?.displayName },
          executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
        }
      }
    },

    async dateLottery(parent, args, context, info) {
      let start = Date.now()
      let { input } = args
      let { req } = context

      let { status, code, pathname, current_user } =  await checkAuthorization(req);
      if(!status && code == FORCE_LOGOUT) throw new AppError(FORCE_LOGOUT, 'Expired!')

      switch(input.mode.toLowerCase()){
        case "new":{
          input = {...input, weight: 1}

          console.log("input : ", input )

          let dateLottery = await DateLottery.create(input);
          
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
  
          let dateLottery = await DateLottery.findOneAndUpdate({ _id: input._id }, input, { new: true });
          return {
            status: true,
            mode: input.mode.toLowerCase(),
            data: dateLottery,
            executionTime: `Time to execute = ${ (Date.now() - start) / 1000 } seconds`
          }
        }

        default:{
          throw new AppError(ERROR, 'Other case')
        }
      }
    },
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
            let authorization = await checkAuthorizationWithSessionId(sessionId);
            let { status, code, current_user } =  authorization

            return data.userId.toString() == current_user?._id.toString() ? true : false;
          } catch(err) {
            console.log("Subscription : ME #ERROR =", err.toString())           
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

          console.log("subscriptionSupplierById : ", mutation, variables.supplierById == data._id)
          switch(mutation){
            case "BOOK":
            case "UNBOOK":
            case "AUTO_CLEAR_BOOK":
              {
                return variables.supplierById == data._id
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
  }
};
