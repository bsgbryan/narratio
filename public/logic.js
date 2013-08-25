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

function render(pid, scope) {
  if (typeof scope.posts !== 'undefined') {
    var post = scope.posts[pid]

    scope.title = marked(post.title)

    var paras = [ ],
        cont  = post.content

    for (var c in cont)
      if (cont.hasOwnProperty(c))
        paras.push(marked(cont[c]))

    scope.paragraphs = paras
    scope.post_id = pid

    scope.editable = post.author.context === author.context && post.author.id === author.id
  }
}

var ReadCtrl = function ($scope, angularFire, $routeParams) {
  var aFire = angularFire(narrated, $scope, 'posts').
    then(function () {
      render($routeParams.post_id, $scope)
    })

    $scope.$on('$routeChangeSuccess', function (next, current) {
      render(current.params.post_id, $scope)
    })
}

var EditCtrl = function ($scope, $location, angularFire, $routeParams) {
  $scope.appendNewParagraph = function () {
    console.log('adding new paragraphs')
    var contents = $('#post #editor .content')

    $(contents[contents.length - 1]).after($(contents[contents.length - 1]).clone().text(''))
  }

  $scope.update = function (pid) {
    var title      = '# ' + $('#editor #title').val()
    var paragraphs = [ ]

    $('#post #editor .content').forEach(function (paragraph) {
      paragraphs.push($(paragraph).val())
    })

    $scope.posts[pid] = { title: title, content: paragraphs, author: author }
  }

  $scope.$on('$routeChangeSuccess', function (next, current) {
    var post = $scope.posts[current.params.post_id]

    $scope.title   = post.title.substring(2)
    $scope.content = post.content
    $scope.post_id = $routeParams.post_id

    console.log(current)
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

var CreateCtrl = function ($scope, $location, angularFire) {
  $scope.templates = { 'paragraph': '/partials/paragraph.html' };

  $scope.appendNewParagraph = function () {
    $('#post #new .content:last-child').after($('#post #new .content:last-child').clone().val(''))
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
}

angular.module('narratio.controllers', [ ]).
  controller(NarratioCtrl, [ '$scope', 'angularFire' ]).
  controller(CreateCtrl,   [ '$scope', '$location', 'angularFire' ]).
  controller(EditCtrl,     [ '$scope', '$location', 'angularFire', '$routeParams' ]).
  controller(ReadCtrl,     [ '$scope', 'angularFireColleciton', '$routeParams' ])

angular.module('narratio', [ 'firebase', 'narratio.controllers' ]).
  config(['$routeProvider', '$locationProvider', function($router, $location) {
    $router.when('/create/post.html',   { 
      templateUrl: '/partials/create.html', 
      controller: 'CreateCtrl'
    })

    $router.when('/read/:post_id.html', { 
      templateUrl: '/partials/read.html',
      controller: 'ReadCtrl'
    })

    $router.when('/edit/:post_id.html', { 
      templateUrl: '/partials/edit.html',
      controller: 'EditCtrl'
    })

    $location.html5Mode(true)
  }])