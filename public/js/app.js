(document).ready(function() {

    // when the save button is clicked, get the article ID and set its saved property to true
 $(".save-btn").on("click", function(event) {
   var newSavedArticle = $(this).data();
   newSavedArticle.saved = true;
   console.log("saved was clicked");
   var id = $(this).attr("data-articleid");
   $.ajax("/saved/" + id, {
     type: "PUT",
     data: newSavedArticle
   }).then(
     function(data) {
       location.reload();
     }
   );
 });

// get new articles when the button is clicked
 $(".scrape-new").on("click", function(event) {
   event.preventDefault();
   $.get("/scrape", function(data) {
     window.location.reload();
   });
 });

 // when the button to removed a saved article from the saved list, get the article ID and set its saved property back to false

 $(".unsave-btn").on("click", function(event) {
   var newUnsavedArticle = $(this).data();
   var id = $(this).attr("data-articleid");
   newUnsavedArticle.saved = false;
   $.ajax("/saved/" + id, {
     type: "PUT",
     data: newUnsavedArticle
   }).then(
     function(data) {
       location.reload();
     }
   );
 });

 // generate the text inside the comments modal
 function createModalHTML(data) {
   var modalText = data.title;
   $("#comment-modal-title").text("Comments for article: " + data.title);
   var commentItem;
   var commentDeleteBtn;
   console.log("data comments length ", data.comments.length)
   for (var i = 0; i < data.comments.length; i++) {
     commentItem = $("<li class='list-group-item'>").text(data.comments[i].body);
     commentItem.addClass("comment-item-list");
     commentItem.attr("id", data.comments[i]._id);
     
     commentDeleteBtn = $("<button> Delete </button>").addClass("btn btn-danger delete-comment-modal");
     commentDeleteBtn.attr("data-commentId", data.comments[i]._id);
     commentItem.prepend(commentDeleteBtn, " ");
     $(".comments-list").append(commentItem);
   }
 }

 // when the add comment button is clicked on the saved articles page, show a modal. Empty the contents first.
 $(".comment-modal-btn").on("click", function(event) {
   var articleId = $(this).attr("data-articleId");
   $("#add-comment-modal").attr("data-articleId", articleId);
   $("#comment-modal-title").empty();
   $(".comments-list").empty();
   $("#comments-body").val("");
   $.ajax("/comments/article/" + articleId, {
     type: "GET"
   }).then(
     function(data) {
       createModalHTML(data);
     }
   );

   // show the modal
   $("#add-comment-modal").modal("toggle");
 });

 // save a comment into the database
 $(document).on("click", ".comment-save-btn", function(event) {
 // $(".comment-save-btn").on("click", function(event) {
   event.preventDefault();
   // Grab the id associated with the article from the submit button
   // var thisId = $(this).attr("data-id");
   var articleId = $("#add-comment-modal").attr("data-articleId");
   // var articleId = $(this).attr("data-articleId");
   var newComment = {
     body: $("#comment-body").val().trim()
   }
   console.log(newComment);
   $.ajax("/submit/" + articleId, {
     type: "POST",
     data: newComment
   })
    // With that done
   .then(function(data) {
     // Log the response
   console.log(data);
   });
   // Also, remove the values entered in the input and textarea for comment entry
   $("#comment-body").val("");
 });

 // delete the comment that was clicked and remove the whole <li> because the text and delete button are included
 $(document).on("click", ".delete-comment-modal", function(event) {
   var commentID = $(this).attr("data-commentId");

   $.ajax("/comments/" + commentID, {
     type: "GET"
   }).then(
     function(data) {
       $("#" + commentID).remove();
     })
 });

});