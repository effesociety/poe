import Joi from '@hapi/joi';
import express from 'express';
import User from '../models/user';
import { signUp } from '../validations/user';
import { parseError, sessionizeUser } from "../util/helpers";

const userRouter = express.Router();
userRouter.post("", async (req, res) => {
  try {
    const { email, password } = req.body;
    await Joi.validate({ email, password }, signUp);

    const newUser = new User({ email, password });
    const sessionUser = sessionizeUser(newUser);
    await newUser.save();

    req.session.user = sessionUser
    res.send(sessionUser);
  } catch (err) {
    res.status(400).send(parseError(err));
  }
});

export default userRouter;