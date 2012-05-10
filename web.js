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
  res.render('index')
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
  var id = req.param('index') * -1 - 1

  redis.lrange('blog.posts', id, id, function(err, data) {
    var post = data[0]

    res.write(post)
    res.end()
  })

})

app.get('/blog.post/write', function(req, res) {
  res.render('create')
})

app.post('/blog.post/publish', function(req, res) {
  redis.lpush('blog.posts',  req.body.content)
  redis.lpush('blog.titles', req.body.title)

  res.send()
})

var port = process.env.PORT || 3000

app.listen(port, function() {
  console.log("Listening on " + port)
})