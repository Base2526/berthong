const cron = require('node-cron');
import { Supplier, Transition} from './model'
import pubsub from './pubsub'
import { checkBalance, checkBalanceBook } from './utils'

import * as Constants from "./constants"

const _ = require('lodash');
const moment = require('moment');


cron.schedule('*/5 * * * *', async() => {
  console.log('[Start] Run task every 5 minute :', new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  try{
    // let users = await User.find({})

    //////////////// clear book ////////////////
    let cleans = []

    let suppliers = await Supplier.find({buys: {$elemMatch:{selected: 0}}});
    await Promise.all(_.map(suppliers, async(supplier)=>{
                        // _.map(supplier.buys, (buy)=>{
                        //   let now       = moment(new Date());     // todays date
                        //   let end       = moment(buy.createdAt);  // another date
                        //   let duration  = moment.duration(now.diff(end));
                        //   console.log( "duration :", buy, duration.asMinutes() )
                        //   if( duration.asMinutes() <= 1 || n.selected == 1 ) {
                        //   }
                        // })

                        let Ids = []
                        let buys = supplier.buys
                        let tranIds = _.groupBy(buys, "transitionId")
                        _.map(tranIds, async(tranId) => {
                          let updateTransition   = true
                          let transitionId       = ""
                          _.map(tranId, (v, i) => {
                            transitionId = v.transitionId

                            let now = moment(new Date());
                            let end = moment(v.createdAt);
                            let duration = moment.duration(now.diff(end));

                            if(duration.asHours() < 2){
                              updateTransition = false
                            }
                          });

                          if( updateTransition && !_.isEmpty(transitionId) ){
                            Ids = [...Ids, transitionId]
                            await Transition.updateOne({ _id: transitionId, status: Constants.WAIT }, { status: Constants.REJECT });
                          }
                        });

                        let newBuys = _.filter(buys, (v) => !_.includes(Ids, v.transitionId))
                        console.log("Run task every minute #3 :", buys, newBuys, Ids)
                        if(!_.isEqual(newBuys, buys)){
                          await Supplier.updateOne({ _id: supplier._id }, { buys: newBuys });
                        }

                        // let { buys } = supplier
                        // let users = [];
                        // let newBuys = _.transform(
                        //   buys,
                        //   (result, n) => {
                        //     var now = moment(new Date());  // todays date
                        //     var end = moment(n.createdAt); // another date
                        //     var duration = moment.duration(now.diff(end));
                        //     // console.log("duration :", duration.asMinutes(), duration.asHours())
                        //     if( duration.asMinutes() <= 1 || n.selected == 1) {
                        //       result.push(n);
                        //     }else{
                        //       users.push(n.userId)
                        //     }
                        //   },
                        //   []
                        // );
                        // console.log("cron.schedule :", newBuys, buys)
                        // if(!_.isEqual(newBuys, buys)){
                        // let tran = await Transition.updateOne({ refId: supplier?._id, userId: current_user?._id, status: Constants.WAIT });
                        //   try{
                        //     await Supplier.updateOne({ _id: supplier?._id }, { ...supplier._doc, buys: newBuys });
                        //     let newSupplier = await Supplier.findById(supplier?._id)
                        //     pubsub.publish("SUPPLIER_BY_ID", {
                        //       supplierById: { mutation: "AUTO_CLEAR_BOOK", data: newSupplier },
                        //     });
                        //     pubsub.publish("SUPPLIERS", {
                        //       suppliers: { mutation: "AUTO_CLEAR_BOOK", data: newSupplier },
                        //     });
                        //     console.log("ping :AUTO_CLEAR_BOOK AUTO_CLEAR_BOOK ", newSupplier)
                        //     // if(!_.isEmpty(users)){
                        //     //   _.map(_.uniqWith(users, _.isEqual), async(userId)=>{
                        //     //     pubsub.publish("ME", {
                        //     //       me: { mutation: "BOOK", data: {userId, data: { /* balance: (await checkBalance(userId)).balance*/ ...await checkBalance(userId) , balanceBook: await checkBalanceBook(userId) } } },
                        //     //     });
                        //     //   })
                        //     // }
                        //   }catch(error){}
                        // }
    }))
    //////////////// clear book ////////////////

    console.log('[End] Run task every 5 minute :', new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  } catch(err) {
    console.log("cron error :", err)
  }
});