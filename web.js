var express = require('express'),
    app     = express.createServer(express.logger()),
    sha1    = require('sha1')

// Production
if (process.env.REDISTOGO_URL) 
  var redis = require('redis-url').connect(process.env.REDISTOGO_URL)
// Development
else 
  var redis = require('redis').createClient()

app.configure(function () {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static('public'));
  
  app.set('views', 'views');
  app.set('view engine', 'jade');
});

app.get('/', function(req, res) {
  res.render('read', { action : 'read' })
})

app.get('/delete/:collection', function(req, res) {
  redis.del(req.param('collection'), function(err, data) {
    if (err)
      res.status(500, err)
    else 
      res.status(200, 'deleted')

    res.end()
  })
})

app.get('/blog.post/read/:index', function(req, res) {
  var id = req.param('index')

  redis.lrange('blog.posts', id, id, function(err, data) {
    res.json(data[0])
    res.end()
  })

})

app.get('/blog.post/write', function(req, res) {
  res.render('write', { action : 'write' })
})

app.post('/blog.post/publish', function(req, res) {
  var post = { 
    title     : req.body.title, 
    content   : req.body.content,
    published : new Date()
  }

  redis.lpush('blog.posts', JSON.stringify(post))

  res.send()
})

var port = process.env.PORT || 3000

app.listen(port, function() {
  console.log("Listening on " + port)
})