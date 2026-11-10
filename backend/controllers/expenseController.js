const xlsx=require('xlsx');
const Expense=require('../models/Expense');

//Add Expense Source
exports.addExpense=async (req,res) => {
    const userId=req.user.id;

    try{
        const{icon,category,amount,date,paymentMethod,notes}=req.body;

        //Validation: Check for missing data
        if(!category || !String(category).trim() || !amount || !date){
            return res.status(400).json({message:"All fields are required"});
        }

        const parsedAmount=Number(amount);
        if(Number.isNaN(parsedAmount) || parsedAmount <= 0){
            return res.status(400).json({message:"Amount must be a positive number"});
        }

        const parsedDate=new Date(date);
        if(Number.isNaN(parsedDate.getTime())){
            return res.status(400).json({message:"Invalid date"});
        }

        const newExpense=new Expense({
            userId,
            icon: icon || "",
            category: String(category).trim(),
            amount: parsedAmount,
            date: parsedDate,
            paymentMethod: paymentMethod ? String(paymentMethod).trim() : "Cash",
            notes: notes ? String(notes).trim() : "",
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
};

//Get All Expense Source
exports.getAllExpense=async (req,res) => {
    const userId=req.user.id;

    try{
        const {search,category,startDate,endDate}=req.query;
        const query={userId};

        if(category && category !== "all"){
            query.category={$regex: new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")};
        }

        if(search && search.trim()){
            const safeSearch=new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
            query.$or=[{category:safeSearch},{notes:safeSearch},{paymentMethod:safeSearch}];
        }

        if(startDate || endDate){
            query.date={};
            if(startDate) query.date.$gte=new Date(startDate);
            if(endDate){
                const end=new Date(endDate);
                end.setUTCHours(23,59,59,999);
                query.date.$lte=end;
            }
        }

        const expense=await Expense.find(query).sort({date:-1,createdAt:-1});
        res.json(expense);
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
};

//Update Expense
exports.updateExpense=async (req,res) => {
    const userId=req.user.id;
    try{
        const {icon,category,amount,date,paymentMethod,notes}=req.body;

        const expense=await Expense.findOne({_id:req.params.id,userId});
        if(!expense){
            return res.status(404).json({message:"Expense record not found"});
        }

        if(category !== undefined){
            if(!String(category).trim()){
                return res.status(400).json({message:"Category is required"});
            }
            expense.category=String(category).trim();
        }

        if(amount !== undefined){
            const parsedAmount=Number(amount);
            if(Number.isNaN(parsedAmount) || parsedAmount <= 0){
                return res.status(400).json({message:"Amount must be a positive number"});
            }
            expense.amount=parsedAmount;
        }

        if(date !== undefined){
            const parsedDate=new Date(date);
            if(Number.isNaN(parsedDate.getTime())){
                return res.status(400).json({message:"Invalid date"});
            }
            expense.date=parsedDate;
        }

        if(icon !== undefined) expense.icon=icon || "";
        if(paymentMethod !== undefined) expense.paymentMethod=String(paymentMethod).trim();
        if(notes !== undefined) expense.notes=String(notes).trim();

        await expense.save();
        res.status(200).json(expense);
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

//Delete Expense Source
exports.deleteExpense=async (req,res) => {
    try{
        const deleted=await Expense.findOneAndDelete({_id:req.params.id,userId:req.user.id});
        if(!deleted){
            return res.status(404).json({message:"Expense record not found"});
        }
        res.json({message:"Expense deleted successfully"});
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

//Download Excel
exports.downloadExpenseExcel=async (req,res) => {
    const userId=req.user.id;
    try{
        const {month,year,search}=req.query;
        const query={userId};

        if(typeof month==="string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(month.trim())){
            const [y,m]=month.trim().split("-").map(Number);
            query.date={
                $gte:new Date(Date.UTC(y,m-1,1)),
                $lt:new Date(Date.UTC(y,m,1)),
            };
        } else if(typeof year==="string" && /^\d{4}$/.test(year.trim())){
            const y=Number(year.trim());
            query.date={
                $gte:new Date(Date.UTC(y,0,1)),
                $lt:new Date(Date.UTC(y+1,0,1)),
            };
        }

        if(search && search.trim()){
            const safeSearch=new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
            query.$or=[{category:safeSearch},{notes:safeSearch},{paymentMethod:safeSearch}];
        }

        const expense=await Expense.find(query).sort({date:-1,createdAt:-1});

        //Prepare data for Excel
        const data=expense.map((item) => ({
            Category:item.category,
            Amount:item.amount,
            "Payment Method":item.paymentMethod || "Cash",
            Date:item.date ? new Date(item.date).toISOString().split("T")[0] : "",
            Notes:item.notes || "",
        }));

        const wb=xlsx.utils.book_new();
        const ws=xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb,ws,"Expense");
        const buffer=xlsx.write(wb,{type:"buffer",bookType:"xlsx"});

        res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition","attachment; filename=expense_details.xlsx");
        res.send(buffer);
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};
