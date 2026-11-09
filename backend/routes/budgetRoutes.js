const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
    getBudgets,
    upsertBudget,
    deleteBudget,
} = require("../controllers/budgetController");

const router = express.Router();

router.get("/", protect, getBudgets);
router.post("/", protect, upsertBudget);
router.delete("/:id", protect, deleteBudget);

module.exports = router;
