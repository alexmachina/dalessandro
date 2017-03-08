let cheerio = require('cheerio')
let request = require('request')
let dbController = require('./dbController')


function CrawlerController() {
  this.process = () => {
    return new Promise((resolve, reject) => {
      request('http://www.artmoveistubular.com.br/', (error, response, body) => {
        let $ = cheerio.load(body)
        let categoriesNode = $('ol').find('li h2 span')
        console.log(categoriesNode.length)
          categoriesNode.each((i, elem) => {
            let category = $(elem).text()
            console.log(category)

          })



      })
    })
  }
}

module.exports = new CrawlerController()
