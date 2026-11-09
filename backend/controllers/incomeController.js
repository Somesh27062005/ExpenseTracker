const xlsx=require('xlsx');
const Income=require('../models/Income');

//Add Income Source
exports.addIncome=async (req,res) => {
    const userId=req.user.id;

    try{
        const{icon,source,amount,date,paymentMethod,notes}=req.body;

        //Validation: Check for missing data
        if(!source || !String(source).trim() || !amount || !date){
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

        const newIncome=new Income({
            userId,
            icon: icon || "",
            source: String(source).trim(),
            amount: parsedAmount,
            date: parsedDate,
            paymentMethod: paymentMethod ? String(paymentMethod).trim() : "Cash",
            notes: notes ? String(notes).trim() : "",
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
};

//Get All Income Source
exports.getAllIncome=async (req,res) => {
    const userId=req.user.id;

    try{
        const {search,source,startDate,endDate}=req.query;
        const query={userId};

        if(source && source !== "all"){
            query.source={$regex: new RegExp(`^${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")};
        }

        if(search && search.trim()){
            const safeSearch=new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
            query.$or=[{source:safeSearch},{notes:safeSearch},{paymentMethod:safeSearch}];
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

        const income=await Income.find(query).sort({date:-1,createdAt:-1});
        res.json(income);
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
};

//Update Income Source
exports.updateIncome=async (req,res) => {
    const userId=req.user.id;
    try{
        const {icon,source,amount,date,paymentMethod,notes}=req.body;

        const income=await Income.findOne({_id:req.params.id,userId});
        if(!income){
            return res.status(404).json({message:"Income record not found"});
        }

        if(source !== undefined){
            if(!String(source).trim()){
                return res.status(400).json({message:"Source is required"});
            }
            income.source=String(source).trim();
        }

        if(amount !== undefined){
            const parsedAmount=Number(amount);
            if(Number.isNaN(parsedAmount) || parsedAmount <= 0){
                return res.status(400).json({message:"Amount must be a positive number"});
            }
            income.amount=parsedAmount;
        }

        if(date !== undefined){
            const parsedDate=new Date(date);
            if(Number.isNaN(parsedDate.getTime())){
                return res.status(400).json({message:"Invalid date"});
            }
            income.date=parsedDate;
        }

        if(icon !== undefined) income.icon=icon || "";
        if(paymentMethod !== undefined) income.paymentMethod=String(paymentMethod).trim();
        if(notes !== undefined) income.notes=String(notes).trim();

        await income.save();
        res.status(200).json(income);
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

//Delete Income Source
exports.deleteIncome=async (req,res) => {
    try{
        const deleted=await Income.findOneAndDelete({_id:req.params.id,userId:req.user.id});
        if(!deleted){
            return res.status(404).json({message:"Income record not found"});
        }
        res.json({message:"Income deleted successfully"});
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};

//Download Excel
exports.downloadIncomeExcel=async (req,res) => {
    const userId=req.user.id;
    try{
        const income=await Income.find({userId}).sort({date:-1});

        //Prepare data for Excel
        const data=income.map((item) => ({
            Source:item.source,
            Amount:item.amount,
            "Payment Method":item.paymentMethod || "Cash",
            Date:item.date ? new Date(item.date).toISOString().split("T")[0] : "",
            Notes:item.notes || "",
        }));

        const wb=xlsx.utils.book_new();
        const ws=xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb,ws,"Income");
        const buffer=xlsx.write(wb,{type:"buffer",bookType:"xlsx"});

        res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition","attachment; filename=income_details.xlsx");
        res.send(buffer);
    }catch(error){
        res.status(500).json({message:"Server Error"});
    }
};
