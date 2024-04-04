const db = require("../models");
const Decimal = require("decimal.js");

const Customer = db.customer;
const Loan = db.loan;

exports.createCustomersInBulk = async (req, res) => {
  const values = req.body.customer.map((item) => ({
    customer_id: item.customer_id,
    first_name: item.first_name,
    last_name: item.last_name,
    age: item.age,
    phone_number: item.phone_number,
    monthly_salary: item.monthly_salary,
    approved_limit: item.approved_limit,
    current_debt: item.current_debt,
  }));
  await Customer.bulkCreate(values);

  res.status(200).send("Bulk insertion completed for customer table.");
};

exports.registerCustomer = async (req, res) => {
  let phone = req.body.phone;
  if (!phone) return res.status(400).send("phone number is required!");
  let customer = await Customer.findOne({
    where: { phone_number: phone },
  });
  if (customer)
    return res.status(409).send("A user with this phone number already exists");

  if (!req.body.first_name)
    return res.status(400).send("first name is required!");
  if (!req.body.last_name)
    return res.status(400).send("last name is required!");
  if (!req.body.age) return res.status(400).send("age is required!");
  if (!req.body.monthly_salary)
    return res.status(400).send("monthly salary is required!");

  const values = {
    customer_id: Math.floor(1000 + Math.random() * 9000),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    age: req.body.age,
    phone_number: phone,
    monthly_salary: req.body.monthly_salary,
    approved_limit:
      Math.round((36 * req.body.monthly_salary) / 100000) * 100000,
    current_debt: 0,
  };
  await Customer.create(values);

  const resp = {
    customer_id: values["customer_id"],
    name: values["first_name"] + " " + values["last_name"],
    age: values["age"],
    monthly_income: values["monthly_salary"],
    approved_limit: values["approved_limit"],
    phone_number: values["phone_number"],
  };

  return res.status(201).send(resp);
};

async function check(cust_id, amt, interest_rate, tenure) {
  let loans = await Loan.findAll({
    where: { customer_id: cust_id },
  });
  let cust_details = await Customer.findOne({
    where: { customer_id: cust_id },
  });

  let credit_score = 0;

  //past Loans paid on time

  //no loans taken

  if (loans.length === 0) credit_score = 100;
  else if (loans.length > 0) {
    let sum_of_loan_amt_left = 0;

    for (let i = 0; i < loans?.length; i++) {
      let loan = loans?.[i];
      const today = new Date();
      const loan_date = new Date(loan.start_date);
      const differenceMs = Math.abs(today - loan_date);
      const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

      // Check if the difference is less than or equal to 365 days or loan activity in current year
      differenceDays <= 365 ? (credit_score -= 5) : (credit_score += 5);
      let diff = loan?.tenure - loan?.emis_paid_on_time;

      if (diff === 0) {
        credit_score += 50;
      } else {
        sum_of_loan_amt_left += diff * loan.monthly_repayment_emi;
      }
    }
    if (sum_of_loan_amt_left > cust_details.approved_limit) credit_score = 0;
  }

  /* else{
      let remain_amt=cust_details.approved_limit-sum_of_loan_amt_left;
      if(amt>remain_amt)amt =remain_amt;
    } */
  if (credit_score > 100) credit_score = 100;

  //no of loans taken in past
  credit_score -= 5 * loans?.length;

  if (credit_score < 0) credit_score = 0;

  let correctedInterestRate = null;
  let approval_status = true;

  if (credit_score > 50) {
    //eligibilityStatus = 'Loan approved';
    correctedInterestRate = interest_rate;
  } else if (50 >= credit_score > 30) {
    //eligibilityStatus = 'Loan approved with interest rate > 12%';
    correctedInterestRate = Math.max(interest_rate, 12);
  } else if (30 >= credit_score > 10) {
    //eligibilityStatus = 'Loan approved with interest rate > 16%';
    correctedInterestRate = Math.max(interest_rate, 16);
  } else {
    //eligibilityStatus = 'Loan not approved';
    correctedInterestRate = 0;
    approval_status = false;
  }

  const t = tenure;
  const r = interest_rate / 100;

  const tot_amount = amt * Math.pow(1 + r, t);
  let monthly_installment = tot_amount / tenure;

  return {
    approval_status,
    monthly_installment,
    correctedInterestRate,
    tot_amount,
  };
}

exports.checkEligibility = async (req, res) => {
  let cust_id = req.body.customer_id;
  let amt = req.body.loan_amount;
  let interest_rate = req.body.interest_rate;
  let tenure = req.body.tenure;

  if (!cust_id) return res.status(400).send("Customer Id should not be empty.");
  if (!amt) return res.status(400).send("Amount should not be empty.");
  if (!interest_rate)
    return res.status(400).send("Interest rate should not be empty.");
  if (!tenure) return res.status(400).send("Tenure should not be empty.");

  let { approval_status, monthly_installment, correctedInterestRate } =
    await check(cust_id, amt, interest_rate, tenure);

  const rounded_monthly_installment = new Decimal(
    monthly_installment
  ).toDecimalPlaces(2);

  const resp = {
    customer_id: cust_id,
    approval: approval_status,
    interest_rate: interest_rate,
    corrected_interest_rate: correctedInterestRate,
    tenure: tenure,
    monthly_installment: rounded_monthly_installment,
  };

  return res.status(200).send(resp);
};
exports.createLoan = async (req, res) => {
  let cust_id = req.body.customer_id;
  let amt = req.body.loan_amount;
  let interest_rate = req.body.interest_rate;
  let tenure = req.body.tenure;

  if (!cust_id) return res.status(400).send("Customer Id should not be empty.");
  if (!amt) return res.status(400).send("Amount should not be empty.");
  if (!interest_rate)
    return res.status(400).send("Interest rate should not be empty.");
  if (!tenure) return res.status(400).send("Tenure should not be empty.");

  let { approval_status, correctedInterestRate, monthly_installment } =
    await check(cust_id, amt, interest_rate, tenure);

  const rounded_monthly_installment = new Decimal(
    monthly_installment
  ).toDecimalPlaces(2);
  const currentTimestamp = Date.now();
  const currentDate = new Date(currentTimestamp);
  let decimalValue = tenure / 12;

  const currentYear = currentDate.getFullYear();
  const decimalYear = currentYear + decimalValue;

  const newDate = new Date(currentDate);
  newDate.setFullYear(decimalYear);

  let loanEndDate = newDate;
  let loanObj = {
    customer_id: cust_id,
    loan_id: Math.floor(1000 + Math.random() * 9000),
    loan_amount: amt,
    tenure: tenure,
    interest_rate: correctedInterestRate,
    monthly_repayment_emi: rounded_monthly_installment,
    emis_paid_on_time: 0,
    start_date: Date.now(),
    end_date: loanEndDate,
  };

  if (!approval_status) {
    return res.status(406).send({
      loan_id: loanObj["loan_id"],
      customer_id: loanObj["customer_id"],
      loan_approved: approval_status,
      monthly_installment: loanObj["monthly_repayment_emi"],
      mesage: "This loan is not eligible to process,check eligibility.",
    });
  }

  await Loan.create(loanObj);

  return res.status(201).send({
    loan_id: loanObj["loan_id"],
    customer_id: loanObj["customer_id"],
    loan_approved: approval_status,
    message: "loan approved!",
    monthly_installment: rounded_monthly_installment,
  });
};
