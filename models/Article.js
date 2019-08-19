var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    require: false
  },
  link: {
    type: String,
    unique: true,
    require: false
  },
  summary: {
    type: String,
    require: false
  },
  saved: {
    type: Boolean,
    default: false
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});


var Article = mongoose.model("Article", ArticleSchema);


module.exports = Article;