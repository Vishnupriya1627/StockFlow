const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req,res) => {
    const {name,email,password} = req.body;
    try {
        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({message:'User already exists, try logging in!!'});
        }

        const hashedPass = await bcrypt.hash(password,14);

        user = new User({
            name,
            email,
            password:hashedPass
        })

        await user.save();

        res.status(201).json({message:'User successfully created',user});

    } catch (e) {
        res.status(500).json({message:'Server Error',e})
    }
}


exports.loginUser = async (req,res) =>{
    const {email,password} = req.body;

    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'Invalid Email or Password'});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:'Invalid Email or Password'});
        }

        const token = jwt.sign({
            userId:user._id,
            email:user.email,
            role:user.role,
        },process.env.JWT_SECRET,{expiresIn:'1d'});

        res.status(200).json({
            message:'Login Successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    }catch(e){
        res.status(500).json({message:'Server Error',error:e.message})
    }
}

exports.getUserById = async (req,res) => {
    try{
        const id = req.user.userId;
        const user = await User.findById(id).select('-password');

        if(!user){
            return res.status(404).json({message : 'User Not Found'});
        }

        res.status(200).json({message:'User details fetched',user});

    }catch(e){
        res.status(500).json({ message: 'Server error', error: e.message });
    }
    
}