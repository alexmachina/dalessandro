let cheerio = require('cheerio')
let request = require('request')
let dbController = require('./dbController')
let categoryModel = require('../models/category')
let productModel = require('../models/product')
let mongoose = require('mongoose')


function CrawlerController() {
  this._baseUrl = 'http://www.artmoveistubular.com.br' 
  this._dbConnect = () => {
    mongoose.connect('mongodb://localhost/loja')
  }

  this._getProducts = (url) => {
    return new Promise((resolve, reject) => {
      let tryParse = () => {
        request(url, (error, response, body) => {
          if(response.statusCode == '503') {
            return tryParse()
          }

          let $ = cheerio.load(body)
          let productsNode = $('#tum .post')
          let operations = []
          productsNode.each((i, elem) => {
            let productUrl = $(elem).find(a).attr('href')
            operations.push(this._getSingleProduct(productUrl))
          })

          let fetchProducts = Promise.all(operations)
          fetchProducts.then(products => {
            resolve(products)
          })
        })
      }
    })
  }

  this._getSingleProduct = (url) => {
    return new Promise((resolve, reject) => {
      let tryParse = () => {
        request(url, (error, response, body) => {
          if (response.statusCode == '503'){ 
            return tryParse()
          }

          let $ = cheerio.load(body)
          let product = new productModel({
            name: $('#nome-do-produto-detalhe').text().trim(),
            description: $('#texto-especifica').text().trim()
          })
        //TODO download images
          resolve(product)

        })
      }
    })
  }
  this._getCategories = (url) => {
    return new Promise((resolve, reject) => {
      let tryParse = () =>  {
        request(this._baseUrl, (error, response, body) => {
          if(response.statusCode == '503') {
            return tryParse()
          }
          let $ = cheerio.load(body)
          let categoriesNode = $('ol li')
          let categories = []
          categoriesNode.each((i, elem) => {

            let category = new categoryModel({
              name: $(elem).find('h2').text(),
              url: this._baseUrl + $(elem).find('div figure a').attr('href')
            })

            categories.push(category)

          })
          resolve(categories)
        })
      }
      tryParse()
    })
  }


  this.process = () => {
    return new Promise((resolve, reject) => {
      this._getCategories(this._baseUrl).then(categories => {
        categories.forEach((c) => {
          c.save().then(() => {
            this._getProducts(c.url).then(products => {
              products.forEach(product => {
                product.save().then(product => {
                  console.log('inserted product ' + product.name)
                })
              })
            })
          })
        })
      })
    })
    console.log("Loggin")
    request(linkToProducts, (error, response, body) => {
      if(response.statusCode === '503') {
        return tryParse()
      }
      $ = cheerio.load(body, {decodeEntities: true})

      this._execProducts(productsNode, category )

    })//request
  }//tryparse

  tryParse()
}) //category.save
  }) //categoriesNode.each
})  //request



  })
}
}

module.exports = new CrawlerController()
