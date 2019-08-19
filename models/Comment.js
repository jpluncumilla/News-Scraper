var mongoose = require("mongoose");

// save a reference to the Schema constructor
var Schema = mongoose.Schema;

// create a new comment schema
var CommentSchema = new Schema({
  body: {
    type: String,
    required: true,
    trim: true
  }
});

// create model
var Comment = mongoose.model("Comment", CommentSchema);

// export the model
module.exports = Comment;