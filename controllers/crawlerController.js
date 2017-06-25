let cheerio = require('cheerio')
let request = require('request')
let dbController = require('./dbController')
let categoryModel = require('../models/category')
let productModel = require('../models/product')
let mongoose = require('mongoose')
let short = require('shortid')
let fs = require('fs')
let http = require('http')


function CrawlerController() {
  this._baseUrl = 'http://www.artmoveistubular.com.br' 
  this._dbConnect = () => {
    mongoose.connect('mongodb://localhost/loja')
  }

  this._getProducts = (url, categoryId) => {
    return new Promise((resolve, reject) => {
      let tryParse = () => {
        console.log('------- parsing category ------: ' + url)
        request(url, (error, response, body) => {
          if(response.statusCode == '503') {
            return tryParse()
            
          }


          let $ = cheerio.load(body)
          let productsNode = $('#tum .post')
          let operations = []

          productsNode.each((i, elem) => {
            let imageUrl = $(elem).find("#img-bloco a img").attr('src')
            let productUrl = $(elem).find('#bloco a').attr('href')
            operations.push(this._getSingleProduct(productUrl, imageUrl, categoryId))
          })

          let fetchProducts = Promise.all(operations)
          fetchProducts.then(products => {
            resolve(products)
          })
        })
      }
        tryParse()
      })
  }

  this._downloadImage = (url) => {
    return new Promise((resolve, reject) => {
      let path = 'img/products/'+short.generate()
      let file = fs.createWriteStream(path)
      let tryParse = () => {
        console.log('parsing image: ' + url)
      http.get(url, response => {
        if(response.statusCode  == '503') {
          return tryParse()
        }
        response.pipe(file)
        debugger
        resolve(path.split('/')[2])
      }).on('error', (err) => {
        reject(err)})
      }
      tryParse()
    })
  }

  this._getSingleProduct = (url, imageUrl, categoryId) => {
    return new Promise((resolve, reject) => {
      let tryParse = () => {
        console.log('parsing product: ' + url)
        request(url, (error, response, body) => {
          if (response.statusCode == '503'){ 
            return tryParse()
          }

          let $ = cheerio.load(body)

          this._downloadImage(imageUrl).then(filename => {
            let product = new productModel({
              name: $('#nome-do-produto-detalhe').text().trim(),
              mainImage: filename,
              description: $('#texto-especifica').text().trim(),
              category: categoryId,
              active: true,
              featured: false
            })

            product.save((err, prod) => {
              if(!err) {

                console.log(prod.name + ' Saved')
              }
            })


          })



        })
      }
      tryParse()
    })
  }
  this._getCategories = (url) => {

    return new Promise((resolve, reject) => {
      let tryParse = () =>  {
        console.log('parsing categories: ' + url)
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
      mongoose.Promise = Promise;
      mongoose.connect('mongodb://localhost/loja')
      this._getCategories(this._baseUrl).then(categories => {
        categories.forEach((c) => {
          c.save((err, c)=> {
            this._getProducts(c.url, c._id).then(products => {
              console.log("End")
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

}

module.exports = new CrawlerController()
