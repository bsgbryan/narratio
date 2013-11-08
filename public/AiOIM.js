AiOIM = function (story) {
  this.comments = new Firebase('https://narratio.firebaseio.com/comments/' + story)
  this.comments.on('child_added', function (snapshot) {
    $('#aioim .messages').append('<li>' +
        '<p>' + snapshot.val().content + '</p>' +
      '</li>')
  })
}

AiOIM.prototype.new_message = function (content, author) {
  this.comments.push({ 
    content: $('#new-message textarea').val(), 
    author:  $.cookie('user_id'), 
    created: Date.now() })
}