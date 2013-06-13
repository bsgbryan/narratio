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

var nReadCtrl = function ($scope, angularFire) {
  angularFire('https://narratio.firebaseio.com', $scope, 'posts')

  $scope.assignPost = function (idx) {

    $scope.title = marked(this.post.title)

    var paras = [ ],
        cont  = this.post.content

    for (var c in cont)
      if (cont.hasOwnProperty(c))
        paras.push(marked(cont[c]))

    $scope.paragraphs = paras
  }
}

angular.module('narratio.controllers', [ ]).

  controller('nCreateCtrl', [ '$scope', '$location', 'angularFire', function ($scope, $location, angularFire) {
    $scope.templates = { 'paragraph': 'partials/paragraph.html' };

    $scope.appendNewParagraph = function () {
      $('#post #new ng-include[src="templates.paragraph"]').after($('#post #new .content:first-child').clone().val(''))
    }

    var url = 'https://narratio.firebaseio.com'

    var promise = angularFire(url, $scope, 'posts')

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

        $scope.posts.push({ title: title, content: paragraphs })
      }
    })
  } ]).

  controller(nReadCtrl, [ '$scope', 'angularFire' ])

angular.module('narratio', [ 'firebase', 'narratio.controllers' ]).
  config(['$routeProvider', function($router) {
    $router.when('/create/post.html',   { 
      templateUrl: 'partials/create.html', 
      controller: 'nCreateCtrl'
    })

    $router.when('/read/:post_id.html', { 
      templateUrl: 'partials/read.html'
    })
  }])