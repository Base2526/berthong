const cron = require('node-cron');

import { User, Supplier, Bank, Role, Deposit, Withdraw, DateLottery, Transition } from './src/model'

cron.schedule('* * * * *', async() => {
  
  try{
    // let users = await User.find({})
    console.log('Run task every minute');
  } catch(err) {
    console.log("cron error :", err)
  }
});