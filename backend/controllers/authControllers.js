const User=require('../models/User');
const jwt=require("jsonwebtoken");

const ALLOWED_CURRENCIES=["USD","INR","EUR","GBP"];

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"7d"});
};

const sanitizeUser = (user) => {
    const obj=user.toObject ? user.toObject() : {...user};
    delete obj.password;
    if(!obj.currency) obj.currency="USD";
    return obj;
};

//Register User
exports.registerUser=async (req,res) => {
    const {fullName,email,password,profileImageUrl,currency}=req.body;

    //Validation: Check for missing fields
    if(!fullName || !email || !password){
        return res.status(400).json({message: "All fields are required"});
    }

    if(password.length < 8){
        return res.status(400).json({message:"Password must be at least 8 characters"});
    }

    try{
        //Check if email already exists
        const existingUser=await User.findOne({email: email.trim()});
        if(existingUser){
            return res.status(400).json({message:"Email already in use"});
        }

        const safeCurrency=ALLOWED_CURRENCIES.includes(currency) ? currency : "USD";

        //Create the user
        const user=await User.create({
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            profileImageUrl: profileImageUrl || null,
            currency: safeCurrency,
        });

        res.status(201).json({
            id:user._id,
            user:sanitizeUser(user),
            token:generateToken(user._id),
        });
    }catch(err){
        console.error("Error in registerUser:", err);
        res
            .status(500)
            .json({message:"Error registering user",error: err.message});
    }
};

//Login User
exports.loginUser=async (req,res) => {
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }
    try{
        const user=await User.findOne({email: email.trim()});
        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({message:"Invalid credentials"});
        }

        res.status(200).json({
            id:user._id,
            user:sanitizeUser(user),
            token:generateToken(user._id),
        });
    }catch(err){
        res
            .status(500)
            .json({message:"Error logging in user",error:err.message});
    }
};

//Get User Info
exports.getUserInfo = async (req,res) => {
    try{
        const user=await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        res.status(200).json(sanitizeUser(user));
    }catch(err){
        res
            .status(500)
            .json({message:"Error fetching user info",error:err.message});
    }
};

//Update User Profile (fullName, profileImageUrl, currency)
exports.updateUserProfile = async (req,res) => {
    try{
        const {fullName,profileImageUrl,currency}=req.body;
        const user=await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        if(fullName !== undefined){
            if(!fullName.trim()){
                return res.status(400).json({message:"Full name cannot be empty"});
            }
            user.fullName=fullName.trim();
        }

        if(profileImageUrl !== undefined){
            user.profileImageUrl=profileImageUrl || null;
        }

        if(currency !== undefined){
            if(!ALLOWED_CURRENCIES.includes(currency)){
                return res.status(400).json({message:"Unsupported currency"});
            }
            user.currency=currency;
        }

        await user.save();
        res.status(200).json({
            message:"Profile updated successfully",
            user:sanitizeUser(user),
        });
    }catch(err){
        res.status(500).json({message:"Error updating profile",error:err.message});
    }
};

//Change Password
exports.changePassword = async (req,res) => {
    try{
        const {currentPassword,newPassword}=req.body;

        if(!currentPassword || !newPassword){
            return res.status(400).json({message:"Both current and new passwords are required"});
        }

        if(newPassword.length < 8){
            return res.status(400).json({message:"New password must be at least 8 characters"});
        }

        const user=await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const isMatch=await user.comparePassword(currentPassword);
        if(!isMatch){
            return res.status(400).json({message:"Current password is incorrect"});
        }

        user.password=newPassword;
        await user.save();

        res.status(200).json({message:"Password updated successfully"});
    }catch(err){
        res.status(500).json({message:"Error updating password",error:err.message});
    }
};
