let crawlerController = require('./controllers/crawlerController')

crawlerController.process().then(result => {
  console.log(result)
})
