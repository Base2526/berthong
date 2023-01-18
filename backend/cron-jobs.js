const cron = require('node-cron');

cron.schedule('* * * * *', () => {
  console.log('Run task every minute');
});