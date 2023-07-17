const cron = require('node-cron');
// import _ from "lodash";
// import moment from "moment"
import { Supplier} from './model'
import pubsub from './pubsub'
import { checkBalance, checkBalanceBook } from './utils'

const _ = require('lodash');
const moment = require('moment');

cron.schedule('*/60 * * * *', async() => {
  console.log('Run task every minute #1 :', new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  try{
    // let users = await User.find({})

    //////////////// clear book ////////////////
    let suppliers = await Supplier.find({buys: {$elemMatch:{selected: 0}}});
    await Promise.all(_.map(suppliers, async(supplier)=>{
                            let { buys } = supplier
                            
                            let users = [];

                            let newBuys = _.transform(
                              buys,
                              (result, n) => {
                                var now = moment(new Date()); //todays date
                                var end = moment(n.createdAt); // another date
                                var duration = moment.duration(now.diff(end));

                                // console.log("duration :", duration.asMinutes(), duration.asHours())
                                
                                if( duration.asMinutes() <= 1 || n.selected == 1) {
                                  result.push(n);
                                }else{
                                  users.push(n.userId)
                                }
                              },
                              []
                            );

                            if(!_.isEqual(newBuys, buys)){
                              try{
                                await Supplier.updateOne({ _id: supplier?._id }, { ...supplier._doc, buys: newBuys });
                              
                                let newSupplier = await Supplier.findById(supplier?._id)
                                pubsub.publish("SUPPLIER_BY_ID", {
                                  supplierById: { mutation: "AUTO_CLEAR_BOOK", data: newSupplier },
                                });

                                pubsub.publish("SUPPLIERS", {
                                  suppliers: { mutation: "AUTO_CLEAR_BOOK", data: newSupplier },
                                });

                                console.log("ping :AUTO_CLEAR_BOOK AUTO_CLEAR_BOOK ", newSupplier)

                                // if(!_.isEmpty(users)){
                                //   _.map(_.uniqWith(users, _.isEqual), async(userId)=>{
                                //     pubsub.publish("ME", {
                                //       me: { mutation: "BOOK", data: {userId, data: { /* balance: (await checkBalance(userId)).balance*/ ...await checkBalance(userId) , balanceBook: await checkBalanceBook(userId) } } },
                                //     });
                                //   })
                                // }
                              }catch(error){}
                            }
    }))
    //////////////// clear book ////////////////

    console.log('Run task every minute #2 :', new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  } catch(err) {
    console.log("cron error :", err)
  }
});