const mongoose=require('mongoose');

const IncomeSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    icon:{type:String,default:""},
    source:{type:String,required:true,trim:true}, //Example: Salary,Freelance, etc.
    amount:{type:Number,required:true,min:0.01},
    date:{type:Date,default:Date.now},
    paymentMethod:{type:String,trim:true,default:"Cash"},
    notes:{type:String,trim:true,default:""},
},{timestamps:true});

IncomeSchema.index({userId:1,date:-1});

module.exports=mongoose.model("Income",IncomeSchema);
