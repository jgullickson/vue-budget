const User = require('../models/user-model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { roles } = require('./roles');

// bcrypt

async function hashPassword(pw){
    return await bcrypt.hash(pw, 10);
}

async function validatePassword(pw_plain, pw_hashed){
    return await bcrypt.compare(pw_plain, pw_hashed);
}

exports.signup = async function(req, res, next){
    try {
        // get info from signup form
        const { email, password, role } = req.body;

        // hash pw
        const hashedPassword = await hashPassword(password);

        //save new user to db with schema we created
        const newUser = new User({
            email,
            password: hashedPassword,
            role: role || 'basic'
        });

        //now that we have the _id from creating the user mongoose, we use it to create the jwt
        const accessToken = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
        //and then assign it to the user
        newUser.accessToken = accessToken;

        await newUser.save();
        res.json({
            data: newUser,
            accessToken
        })
    } catch(error){
        next(error)
    }
};

exports.login = async function(req, res, next){
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return next(new Error('No user found with that email'))
        };

        const validPassword = await validatePassword(password, user.password);

        if (!validPassword){
            return next(new Error('Password is incorrect'));
        };

        // create a new access token
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d'});

        // why not just update the user we've accessed above?
        await User.findByIdAndUpdate(user._id, { accessToken });

        res.status(200).json({
            data: {email: user.email, role: user.role },
            accessToken
        })

    } catch(error){
        next(error);
    }
};

exports.getUsers = async function(req, res, next){
    let users = await User.find();
    res.status(200).json({
        data: users
    });
};

exports.getUser = async function(req, res, next){
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return next(new Error('User does not exist'))
        };

        res.status(200).json({
            data: user
        });
    } catch(error){
        next(error)
    }
};

exports.updateUser = async function(req, res, next){
    try {
        const update = {
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        };
        const userId = req.params.userId;
        await User.findByIdAndUpdate(userId, update);
        const user = await User.findById(userId);

        res.status(200).json({
            data: user,
            message: 'User has been updated'
        })
    } catch(error){
        next(error)
    }
};

exports.deleteUser = async function(req, res, next){
    try {
        const userId = req.params.userId;
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            data: null,
            message: 'User deleted'
        })
    } catch(error){
        next(error)
    }
};

exports.grantAccess = function(action, resource){
    return async function(req, res, next){
        try {
            const permission = roles.can(req.user.role)[action](resource);
            if (!permission.granted) {
             return res.status(401).json({
              error: "You don't have enough permission to perform this action"
             });
            }
            next()
           } catch (error) {
            next(error)
           }
    }
}

exports.allowIfLoggedin = async (req, res, next) => {
 try {
  const user = res.locals.loggedInUser;
  if (!user)
   return res.status(401).json({
    error: "You need to be logged in to access this route"
   });
   req.user = user;
   next();
  } catch (error) {
   next(error);
  }
}

