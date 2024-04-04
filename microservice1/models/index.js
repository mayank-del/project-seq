const {Sequelize, DataTypes}=require("sequelize");

const sequelize = new Sequelize('alemeno','root', 'root', {
    host: 'mysql',
    logging:false,
    port:3306,
    dialect: "mysql" })
   

  try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
  }catch (error) {
    console.error('Unable to connect to the database:', error);
  }
const db={}
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.customer=  require('./customer')(sequelize,DataTypes)
db.loan=  require('./loan')(sequelize,DataTypes)

db.sequelize.sync({
   alter: true,
    force: false,
  })

module.exports=db