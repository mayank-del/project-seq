const express = require("express");
const app = express();
const cors = require("cors");


app.use(express.json({ limit: "20mb" }));
app.use(cors());

const allRoutes = require("./routes/main.routes");
require("./models");

app.use("/api", allRoutes);

const port = 4000;
app.listen(port, () => {
  console.log("server is listening to port:", port);
});
