module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define(
    "Loan",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Set auto-increment to true
            allowNull: false
          },
        
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      loan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      loan_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tenure: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      interest_rate: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      monthly_repayment_emi: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      emis_paid_on_time : {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "loan",
      timestamps:true
    }
  );
  return Loan;
};
