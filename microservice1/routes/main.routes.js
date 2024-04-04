const express = require("express");

const {
  createCustomersInBulk,
  checkEligibility,
  registerCustomer,
  createLoan,
} = require("../controllers/customers");
const {
  createLoansInBulk,
  viewLoan,
  viewStatement,
  makePayment,
} = require("../controllers/loans");

const router = express.Router();

router.post("/create/bulk/customers", createCustomersInBulk);
router.post("/register", registerCustomer);
router.post("/check-eligibility", checkEligibility);
router.post("/create-loan", createLoan);

router.post("/create/bulk/loans", createLoansInBulk);
router.get("/view-loan/:loan_id", viewLoan);
router.get("/view-statement/:cust_id/:loan_id", viewStatement);
router.post("/make-payment/:cust_id/:loan_id", makePayment);

module.exports = router;
