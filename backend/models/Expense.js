const mongoose=require('mongoose');

const ExpenseSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    icon:{type:String,default:""},
    category:{type:String,required:true,trim:true}, //Example: Food,Rent,Groceries
    amount:{type:Number,required:true,min:0.01},
    date:{type:Date,default:Date.now},
    paymentMethod:{type:String,trim:true,default:"UPI / Card"},
    notes:{type:String,trim:true,default:""},
},{timestamps:true});

ExpenseSchema.index({userId:1,date:-1});

module.exports=mongoose.model("Expense",ExpenseSchema);
