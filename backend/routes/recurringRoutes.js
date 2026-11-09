const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
    getRecurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    syncRecurringNow,
} = require("../controllers/recurringController");

const router = express.Router();

router.get("/", protect, getRecurringTransactions);
router.post("/", protect, addRecurringTransaction);
router.post("/sync", protect, syncRecurringNow);
router.put("/:id", protect, updateRecurringTransaction);
router.delete("/:id", protect, deleteRecurringTransaction);

module.exports = router;
