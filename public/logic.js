marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  langPrefix: 'language-',
  highlight: function(code, lang) {
    if (lang === 'js') {
      return highlighter.javascript(code);
    }
    return code;
  }
})

var narrated = 'https://narratio.firebaseio.com/narrated'

var url        = 'https://narratio.firebaseio.com',
    author     = { context: null, name: null }
    narratio   = new Firebase(url),
    authinator = new FirebaseSimpleLogin(narratio, function(error, user) {
      if (error) {
        console.log(error);
      } else if (user) {
        $('#actions').show()
        $('#login').hide()
        
        author.context = user.provider
        author.name    = user.displayName
        author.id      = user.id
      } else {
        $('#actions').hide()
        $('#login').show()

        $('#login a').on('click', function () {
          var method = $(this).attr('id'),
              params = { rememberMe: true }

          if (method === 'facebook')
            params.scope = 'email'
          if (method === 'github')
            params.scope = 'user'

          authinator.login(method, params)

          return false
        })
      }
    })

var ReadCtrl = function ($scope, angularFire, $routeParams) {
  angularFire(narrated, $scope, 'posts').
    then(function () {
      var pid  = $routeParams.post_id,
          post = $scope.posts[pid]

      $scope.title = marked(post.title)

      var paras = [ ],
          cont  = post.content

      for (var c in cont)
        if (cont.hasOwnProperty(c))
          paras.push(marked(cont[c]))

      $scope.paragraphs = paras

      $scope.editable = post.author.context === author.context && post.author.id === author.id
    })
}

var NarratioCtrl = function ($scope, angularFire) {
  angularFire(narrated, $scope, 'posts')

  $scope.assignPost = function (idx) {

    $scope.title = marked(this.post.title)

    var paras = [ ],
        cont  = this.post.content

    for (var c in cont)
      if (cont.hasOwnProperty(c))
        paras.push(marked(cont[c]))

    $scope.paragraphs = paras

    $scope.editable = this.post.author.context === author.context && this.post.author.id === author.id
  }
}

angular.module('narratio.controllers', [ ]).

  controller('nCreateCtrl', [ '$scope', '$location', 'angularFire', function ($scope, $location, angularFire) {
    $scope.templates = { 'paragraph': 'partials/paragraph.html' };

    $scope.appendNewParagraph = function () {
      $('#post #new ng-include[src="templates.paragraph"]').after($('#post #new .content:first-child').clone().val(''))
    }

    var promise = angularFire(narrated, $scope, 'posts')

    if ($location.path() === '')
      $location.path('/')
    
    $scope.location = $location

    promise.then(function () {
      $scope.publish = function () {
        var title      = '# ' + $('#new #title').val()
        var paragraphs = [ ]

        $('#new .content').forEach(function (paragraph) {
          paragraphs.push($(paragraph).val())
        })

        $scope.posts.push({ title: title, content: paragraphs, author: author })
      }
    })
  } ]).

  controller(NarratioCtrl, [ '$scope', 'angularFire' ]).
  controller(ReadCtrl, [ '$scope', 'angularFireColleciton', '$routeParams' ])

angular.module('narratio', [ 'firebase', 'narratio.controllers' ]).
  config(['$routeProvider', function($router) {
    $router.when('/create/post.html',   { 
      templateUrl: 'partials/create.html', 
      controller: 'nCreateCtrl'
    })

    $router.when('/read/:post_id.html', { 
      templateUrl: 'partials/read.html',
      controller: 'ReadCtrl'
    })
  }])