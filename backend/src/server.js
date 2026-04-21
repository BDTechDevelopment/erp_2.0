require("dotenv").config();

const express = require("express");
const cors = require("cors");
const router = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(router);

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running on port 3001");
});