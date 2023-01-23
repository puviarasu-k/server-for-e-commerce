var express = require('express')
var app = express();
var cors = require('cors')
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
const user = require('./models/user')
var jwt = require('jsonwebtoken');
const product = require('./models/products')
const SubCategory3 = require('./models/subCategory3.model')
const multer = require('multer'),
  path = require('path');

mongoose.connect("mongodb://127.0.0.1/productDB");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}))

app.get('/laka', (req, res) => {
  const Token = jwt.sign({ user: "puviarasu" }, 'JWT_SECRET');
  // const Token = jwt.sign({ email: 'engineering@unipick.com', userRole: 'ADMIN' }, 'unipickclaritaz123');

  console.log(Token);
  res.send(Token)
})


app.post('/search', (req, res) => {
  user.find({ $or: [{ username: { $regex: req.body.searchValue, $options: 'i' } }, { email: { $regex: req.body.searchValue, $options: 'i' } }] }, (err, data) => {
    res.status(200).send({
      message: 'success',
      status: 200,
      users: data
    })
  })
})

app.post('/getusers', async (req, res) => {
  const limit = 5
  let skip = req.body.page * 5
  // if(req.body.pagesort){
  //   let skip2 = req.body.pagesort * 5
  //   skip = skip2-(req.body.pagesort*2)
  // }
  // const skip = (req.body.pagesort - 1) * limit;
  // let skip = (req.body.page - 1) * limit

  // const searchValue = req.body.searchValue ? req.body.searchValue : ''
  // if(req.body.filterValue=='buyer'||req.body.filterValue =='admin'){
  //   const data = await user.aggregate([
  //     { $match: { "userRole": { $eq: req.body.filterValue } , username: { $regex: searchValue, $options: 'i' } , email: { $regex: searchValue, $options: 'i' } } },
  //     // {$or: [{ username: { $regex: searchValue, $options: 'i' } }, { email: { $regex: searchValue, $options: 'i' } }]}
  //   ]).sort({username : 1})
  //   res.status(200).send({
  //         message: 'success',
  //         status: 200,
  //         users : data
  //       })
  // }
  let value = req.body.value
  let field = req.body.field
  const searchValue = req.body.searchValue ? req.body.searchValue : ''
  // const first =  Object.assign(field,value)
  var obj = {};
  if (req.body.filterValue) {
    // obj.push({userRole : req.body.filterValue, $or: [{ userRole : req.body.userRole , username: { $regex: searchValue, $options: 'i' } }, { email: { $regex: searchValue, $options: 'i' } }]})
    obj = {
      userRole: req.body.filterValue, $or: [{ username: { $regex: searchValue, $options: 'i' } }, { email: { $regex: searchValue, $options: 'i' } }]
    }
  }
  else {
    obj = {
      $or: [{ username: { $regex: searchValue, $options: 'i' } }, { email: { $regex: searchValue, $options: 'i' } }]
    }
  }
  console.log(obj);
  const data = await user.find(obj).skip(skip).limit(limit).sort({ [field]: value })
  const count = await user.find({}).count()
  // user.find({ $or: [{ username: { $regex: searchValue, $options: 'i' } }, { email: { $regex: searchValue, $options: 'i' } }] }, (err, data) => {
  res.status(200).send({
    message: 'success',
    status: 200,
    users: data,
    count: count
    // })
  })
})

app.post('/getprods', async (req, res) => {
  const limit = 5
  const skip = req.body.page * 5
  let value = req.body.value
  let field = req.body.field
  const searchValue = req.body.searchValue ? req.body.searchValue : ''
  var obj = {};
  if (req.body.filterValue) {
    obj = {
      status: req.body.filterValue, $or: [{ productname: { $regex: searchValue, $options: 'i' } }, { description: { $regex: searchValue, $options: 'i' } }]
    }
  }
  else {
    obj = {
      $or: [{ productname: { $regex: searchValue, $options: 'i' } }, { description: { $regex: searchValue, $options: 'i' } }]
    }
  }
  console.log(obj);
  const data = await product.find(obj).sort({ [field]: value }).skip(skip).limit(limit)
  const count = await product.find({}).count()
  res.status(200).send({
    message: 'success',
    status: 200,
    users: data,
    count: count
    // })
  })
})


app.get('/listing/:proname', (req, res) => {
  product.findOne({ sellerid: req.params.proname }, (err, data) => {
    if (data) {
      // res.status(200).json({
      //   status: true,
      //   title: 'Product retrived.',
      //   products: data,
      // });
      res.json(data);
    }
    else {
      res.status(400).json({
        status: false,
      });
    }


  })
})

app.get('/listingpage/:proname', (req, res) => {
  product.findOne({ _id: req.params.proname }, (err, data) => {
    if (data) {
      // res.status(200).json({
      //   status: true,
      //   title: 'Product retrived.',
      //   products: data,
      // });
      res.json(data);
    }
    else {
      res.status(400).json({
        status: false,
      });
    }


  })
})


app.post("/login", (req, res) => {
  if (req.body.username) {
    user.findOne({ username: req.body.username }, (err, data) => {
      if (!data) {
        res.status(400).send({
          message: 'The user does not exist',
          status: false
        });
      }
      else if (data) {
        user.findOne({ username: req.body.username, password: req.body.password }, (err, data) => {
          if (data) {
            const name = data.username;
            const Id = data._id;
            const userRole = data.userRole;
            const Token = jwt.sign({ user: data.username, id: data._id }, 'JWT_SECRET');
            product.find({ "sellerid": Id }, (err, data) => {
              if (data) {
                res.status(200).send({
                  statusCode: 200,
                  status: "Success",
                  contains: true,
                  token: Token,
                  userRole: userRole,
                  products: data,
                  nameuser: name,
                  id: Id
                })
              }
              else {
                res.status(200).send({
                  statusCode: 200,
                  status: "Success",
                  token: Token,
                  nameuser: name,
                  contains: false,
                  id: Id
                });
              }
            })
          }
          else {
            res.status(400).send({
              statusCode: 400,
              status: "Error",
              message: 'Username or password is incorrect!',
            });
          }
        })
      }
    })
  }
})


app.post("/register", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {

      user.find({ username: req.body.username }, (err, data) => {

        if (data.length == 0) {

          let User = new user({
            username: req.body.username,
            password: req.body.password,
            mobile: req.body.mobile,
            email: req.body.email
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
            } else {
              res.status(200).json({
                status: true,
                message: 'Registered Successfully.'
              });
            }
          });

        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.username} Already Exist!`,
            status: false
          });
        }

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.post("/productadd", (req, res) => {

  let products = new product({
    productname: req.body.productname,
    description: req.body.description,
    variant: req.body.variant
  })

  products.save((err, data) => {
    if (err) {
      res.status(400).json({
        errorMessage: err,
        status: false
      });
    } else {
      res.status(200).json({
        status: true,
        title: 'Product added Successfully.'
      });
    }
  });


})

app.post("/editupdate", async (req, res) => {
  console.log(req.body);
  await product.updateOne({ productname: req.body.data.productname }, req.body.data)
  res.send("success")
})

app.post("/status", async (req, res) => {
  if (req.body.status == 'accept') {
    await product.updateOne({ sellerid: req.body.productname }, { $set: { status: 'APPROVED' } })
  }
  else if (req.body.status == 'reject') {
    await product.updateOne({ sellerid: req.body.productname }, { $set: { status: 'REJECTED', rejectReason: req.body.rejectreason } })
  }
  res.send("success")
})

app.get("/summa", async (req, res) => {
  const data = await SubCategory3.find({});
  const result = [];

  var regex = /^[A-Za-z0-9 ]+$/

  //Validate TextBox value against the Regex.
  for (const element of data) {
    var isValid = regex.test(element.name);
    if (!isValid) {
      // alert("Contains Special Characters.");
      // res.send(element)
      result.push(element)
    }

    // return isValid;
  }

  res.send({
    count: result.length,
    result: result
  })
})



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
var upload = multer({ storage: storage })

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(file)
})


// let bg = 
console.log('drfbgvdfgb',new Date);
console.log(fetch('https://jsonplaceholder.typicode.com/todos/1')?"gh":"kj",new Date);



app.listen(2000, () => {
  console.log("server is started")
})
