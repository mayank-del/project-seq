const db = require("../models");

const Loan = db.loan;
const Customer = db.customer;

exports.createLoansInBulk = async (req, res) => {
  const values = req.body.loan.map((item) => ({
    customer_id: item.customer_id,
    loan_id: item.loan_id,
    loan_amount: item.loan_amount,
    tenure: item.tenure,
    interest_rate: item.interest_rate,
    monthly_repayment_emi: item.monthly_repayment_emi,
    emis_paid_on_time: item.emis_paid_on_time,
    start_date: item.start_date,
    end_date: item.end_date,
  }));
  await Loan.bulkCreate(values);
  res.status(200).send("Bulk insertion completed for loan table.");
};

exports.viewLoan = async (req, res) => {
  let loanId = req.params.loan_id;

  const loan = await Loan.findOne({ where: { loan_id: loanId } });
  if (!loan) return res.status(404).send("loan id not found!");

  const customer_details = await Customer.findOne({
    where: { customer_id: loan.customer_id },
  });

  const response = {
    loan_id: loanId,
    customer: {
      id: customer_details.customer_id,
      first_name: customer_details.first_name,
      last_name: customer_details.last_name,
      age: customer_details.age,
      phone_number: customer_details.phone_number,
    },
    loan_amount: loan.loan_amount,
    tenure: loan.tenure,
    interest_rate: loan.interest_rate,
  };

  return res.status(200).send(response);
};

exports.viewStatement = async (req, res) => {
  let loanId = req.params.loan_id;
  let customerId = req.params.cust_id;

  const loan = await Loan.findOne({
    where: { loan_id: loanId, customer_id: customerId },
  });
  if (!loan) return res.status(404).send("loan id not found!");

  const response = {
    customer_id: customerId,
    loan_id: loanId,
    principal: loan.loan_amount,
    interest_rate: loan.interest_rate,
    Amount_paid: loan.emis_paid_on_time * loan.monthly_repayment_emi,
    monthly_installment: loan.monthly_repayment_emi,
    repayments_left:
      (loan.tenure - loan.emis_paid_on_time) * loan.monthly_repayment_emi,
  };

  return res.status(200).send(response);
};

exports.makePayment = async (req, res) => {
  let loanId = req.params.loan_id;
  let customerId = req.params.cust_id;

  let amt_paid = req.body.amount_paid;

  const loan = await Loan.findOne({
    where: { loan_id: loanId, customer_id: customerId },
  });
  if (!loan) return res.status(404).send("loan id not found!");

  if (
    amt_paid >
    (loan.tenure - loan.emis_paid_on_time) * loan.monthly_repayment_emi
  ) {
    return res
      .status(400)
      .send("You are paying more debt than debt left on your loan!");
  }

  let new_emis_paid_on_time = loan.emis_paid_on_time + 1;
  if (amt_paid !== loan.monthly_repayment_emi) {
    let amt_left =
      (loan.tenure - loan.emis_paid_on_time) * loan.monthly_repayment_emi;
    let new_amt_left = amt_left - amt_paid;
    let tenure_left = loan.tenure - new_emis_paid_on_time;

    let new_monthly_repayment_emi = new_amt_left / tenure_left;

    loan["monthly_repayment_emi"] = new_monthly_repayment_emi;
  }
  loan["emis_paid_on_time"] = new_emis_paid_on_time;

  await Loan.update(
    {
      emis_paid_on_time: loan["emis_paid_on_time"],
      monthly_repayment_emi: loan["monthly_repayment_emi"],
    },
    { where: { loan_id: loanId, customer_id: customerId } }
  );

  return res.status(200).send(loan);
};
