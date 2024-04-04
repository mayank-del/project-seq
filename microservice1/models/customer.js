module.exports=(sequelize,DataTypes)=>{

    const Customer=sequelize.define('Customer',{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Set auto-increment to true
            allowNull: false
          },        
        customer_id:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
          },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
          },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
        phone_number: {
            type: DataTypes.BIGINT,
            allowNull: false
          },
        monthly_salary: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
        approved_limit: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
        current_debt: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
    },
    {
        sequelize,
        tableName:'customer',
        timestamps:true
    });
    return Customer
}