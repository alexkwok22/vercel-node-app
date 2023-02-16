const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const ddSchema = new Schema({
  name2: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  standard: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Dd", ddSchema);
