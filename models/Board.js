let mongoose = require('../models/Mongoose.js');

let Schema = mongoose.Schema;
let boardSchema = new Schema({
  name: {type: String, required: true},
  thread: [
    {
      text: {type: String},
      created_on: {type: Date},
      bumped_on: {type: Date},
      reported: {type: Boolean},
      delete_password: {type: String},
      replies: [
        {
          text: {type: String},
          created_on: {type: Date},
          delete_password: {type: String},
          reported: {type: Boolean}
        }
      ]
    }
  ]
});

//Glitch is giving errors in the next line but is working as it should!
module.exports = Board = mongoose.model('Board', boardSchema);