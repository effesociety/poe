const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const usersSchema = require('../schemas/users-schema')
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

    const { email, password } = req.body;
    try {
      let user = await usersSchema.findOne({email})
      if (user) {
        return res.status(400).json({
          msg: "User Already Exists"
        })
      }

      user = new usersSchema({
        id: Math.random().toString(36).substring(2),
        email,
        password,
        role: req.body.role || "student",
        courses: []
      })

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt)

      await user.save()

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
      return res.status(400).json({
        errors: errors.array()
      })
    }

    const { email, password } = req.body
    try {
      let user = await usersSchema.findOne({email})
      if (!user)
        return res.status(400).json({
          message: "User Not Exist"
        })

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch)
        return res.status(400).json({
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

userRouter.post(
  "/logout",
  (req, res) => {
	  res.clearCookie()
    res.status(200).json({
      message: "Success"
    })
  }
)

userRouter.post(
  "/auth",
  async (req,res) => {
    var cookies = cookie.parse(req.headers.cookie || '')
    var token = cookies.token
    if(token){
      var decoded = jwt.verify(token,process.env.JWT_SECRET)
      var email = decoded.user.email
      try {
        let user = await usersSchema.findOne({email})
        if(user){
          return res.status(200).json({
            email: user.email,
            role: user.role,
            courses: user.courses
          })
        }
        else {
          return res.status(400).json({
            message: "User Not Exist"
          })
        }
      } catch (err){
        console.error(err)
        res.status(500).json({
          message: "Server Error"
        })
      }
    }
    else {
      res.status(500).json({
        message: "Unidentified Token"
      })
    }
  }
)

module.exports = userRouter
