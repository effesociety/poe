const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const usersSchema = require('../schemas/users-schema')
const helper = require('../utils/helpers')
const userRouter = express.Router()

userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({extended:false}))

userRouter.post(
  "/signup",
  [
    check("email", "Please enter a valid email")
      .not()
      .isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 4
    })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    const { email, password } = req.body
    try {
      let user = await usersSchema.findOne({email})
      if (user) {
        return res.status(400).json({
          msg: "User already exists"
        })
      }

      user = new usersSchema({
        email,
        password,
        role: req.body.role || "student",
        courses: []
      })

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt)

      await user.save()
      console.log("Registered user:\n", user)
      const payload = {
        user: {
          id: user.id,
          email: email
        }
      }

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '24h'
        },
        (err, token) => {
          if (err) throw err;
          res.cookie('token', token, { httpOnly: true })
          res.status(200).json({
            email: user.email,
            role: user.role,
            courses: user.courses
          })
        }
      )
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
)

userRouter.post(
  "/login",
  [
    check("email", "Please enter a valid email").not().isEmpty(),
    check("password", "Please enter a valid password").isLength({
      min: 4
    })
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array()
      })
    }

    const { email, password } = req.body
    try {
      let user = await usersSchema.findOne({email})
      if (!user)
        return res.status(400).json({
          message: "User not exists"
        })

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch)
        res.status(400).json({
          message: "Incorrect Password !"
        })

      const payload = {
        user: {
          id: user.id,
          email: email
        }
      }

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '24h'
        },
        (err, token) => {
          if (err) throw err;
          res.cookie('token', token, { httpOnly: true })
          console.log("Logged user:\n",user)
          res.status(200).json({
            email: user.email,
            role: user.role,
            courses: user.courses
          })
        }
      )

    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      })
    }
  }
)

userRouter.delete(
  "/logout",
  (req, res) => {
	  res.clearCookie('token')
    res.status(200).json({
      message: "Success"
    })
  }
)

userRouter.get(
  "/auth",
  async (req,res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    helper.checkUser(cookies,res).then(user => {
      if(user){
        console.log("Authentication user",user.email)
        res.status(200).json({
          email: user.email,
          role: user.role,
          courses: user.courses
        })
      }
      else
        res.status(400).json({
          message: "User Not Exist"
        })
    })
  }
)

module.exports = userRouter
