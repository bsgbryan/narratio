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

var url      = 'https://narratio.firebaseio.com',
    narrated = url + '/narrated',
    author   = { contexts: null, id: $.cookie('user_id') },
    services = [ ],
    authenticator = $.Deferred(),
    aioim

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

    scope.editable = post.author.id === author.id

    $('#post').attr('data-story', pid)
  }
}

var Narratio = function ($scope, angularFire) {
  contents = angularFire(narrated, $scope, 'posts')

  $.getJSON('https://api.singly.com/profile?access_token=' + $.cookie('token'), function (response) {
    var svcs = [ ]

    for (var s in response.services)
      svcs.push(s)

    $.post('/author', { id: response.id, contexts: svcs }).
      done(function (token) {
        new Firebase(url).auth(token, function (err) {
          if (err)
            console.log('error', err)
          else {
            author.contexts = svcs
            author.id = response.id
            services = response.services

            $.cookie('user_id', response.id)
            services = response.services

            authenticator.resolve()
          }
        })
    })
  })

  $scope.assignPost = function (idx) {
    $scope.title = marked(this.post.title)

    var paras = [ ],
        cont  = this.post.content

    for (var c in cont)
      if (cont.hasOwnProperty(c))
        paras.push(marked(cont[c]))

    $scope.paragraphs = paras

    $scope.editable = this.post.author === author.id
  }
}

var Creator = function ($scope, $location, angularFire, svcs) {
  for (var s in svcs)
    $('#contexts .' + svcs[s]).addClass('attached')

  $scope.templates = { 'paragraph': '/partials/paragraph.html' }

  $scope.appendNewParagraph = function () {
    $('#post #new .content:last-child').after($('#post #new .content:last-child').clone().val(''))
  }

  $scope.publish = function () {
    var title      = '# ' + $('#new #title').val()
    var paragraphs = [ ]
    var contexts   = [ ]

    $('#new .content').each(function (i, paragraph) {
      paragraphs.push($(paragraph).val())
    })

    $('#new #contexts .selected input').each(function (i, context) {
      contexts.push($(context).val())
    })

    $scope.posts.push({ 
      title: title, 
      content: paragraphs, 
      contexts: contexts,
      author: $.cookie('author'), 
      published: new Date().getTime() 
    })
  }
}

var Reader = function ($scope, $routeParams) {
  contents.then(function () {
    render($routeParams.post_id, $scope)
  })
  
  $scope.$on('$routeChangeSuccess', function (next, current) {
    render(current.params.post_id, $scope)
    aioim = new AiOIM(current.params.post_id, '#aioim .messages')
  })
}

var Editor = function ($scope, $location, angularFire, $routeParams) {
  $scope.appendNewParagraph = function () {
    var contents = $('#post #editor .content')

    $(contents[contents.length - 1]).after($(contents[contents.length - 1]).clone().text(''))
  }

  $scope.update = function (pid) {
    var title      = '# ' + $('.editor #title').val()
    var paragraphs = [ ]
    var contexts   = [ ]

    $('#post .editor .content').each(function (i, paragraph) {
      paragraphs.push($(paragraph).val())
    })

    $('#post .editor #contexts .selected input').each(function (i, context) {
      contexts.push($(context).val())
    })

    $scope.posts[pid] = { 
      title: title, 
      content: paragraphs, 
      author: author, 
      published: $scope.posts[pid].published, 
      lastEdited: new Date().getTime(),
      contexts: contexts
    }
  }

  // This should happen in a resolve: handler
  $scope.$on('$routeChangeSuccess', function (next, current) {
    var post = $scope.posts[current.params.post_id]

    $scope.title   = post.title.substring(2)
    $scope.content = post.content
    $scope.post_id = $routeParams.post_id

    for (var c in post.contexts)
      $('#post .editor #contexts .' + post.contexts[c]).addClass('selected')
  })
}

var Peruser = function ($scope, $routeParams) {
  contents.then(function () {
    var peruse = [ ]

    $scope.context = $routeParams.context

    for (var p in $scope.posts) {
      if (!$scope.posts[p].contexts)
        $scope.posts[p].contexts = [ ]

      if ($routeParams.context === 'private' && $scope.posts[p].contexts.length === 0) {
        $scope.posts[p].idx = p
        peruse.push($scope.posts[p])
      } else if ($scope.posts[p].contexts.indexOf($routeParams.context) > -1) {
        $scope.posts[p].idx = p
        peruse.push($scope.posts[p])
      }
    }

    $scope.peruse = peruse
  })
}

var Deleter = function ($scope, $location) {
  $scope.remove = function (pid) {
    $scope.posts.splice(pid, 1)
  }

  $scope.$on('$routeChangeSuccess', function (next, current) {
    $scope.post_id = current.params.post_id
  })
}

function loadSyncedProfileInfo() {
  authenticator.promise().done(function () {
    console.log('boo')
    for (var service in services)
      $('#synced .service.' + service + ' .avatar').attr('src', services[service].thumbnail_url)
  })
}

var Profiler = function ($scope) {
  loadSyncedProfileInfo()
}

angular.module('narratio.controllers', [ ]).
  controller(Narratio, [ '$scope', 'angularFire' ]).
  controller(Creator,  [ '$scope', '$location', 'angularFire' ]).
  controller(Editor,   [ '$scope', '$location', 'angularFire', '$routeParams' ]).
  controller(Peruser,  [ '$scope', '$routeParams' ]).
  controller(Reader,   [ '$scope', '$routeParams' ]).
  controller(Deleter,  [ '$scope', '$locationProvider' ]).
  controller(Profiler, [ '$scope' ])

angular.module('narratio', [ 'firebase', 'narratio.controllers' ]).
  config(['$routeProvider', '$locationProvider', function($router, $location) {
    $router.when('/create/post',   { 
      templateUrl: '/partials/create', 
      controller: 'Creator',
      resolve: {
        svcs: function ($q) {
          var out = $q.defer()

          authenticator.promise().done(function () {
            var keys = Object.keys(services)

            out.resolve(keys)
          })
          
          return out.promise
        }
      }
    })

    $router.when('/read/:post_id', { 
      templateUrl: '/partials/read',
      controller: 'Reader'
    })

    $router.when('/peruse/:context', { 
      templateUrl: '/partials/peruse',
      controller: 'Peruser'
    })

    $router.when('/edit/:post_id', { 
      templateUrl: '/partials/edit',
      controller: 'Editor'
    })

    $router.when('/delete/:post_id', { 
      templateUrl: '/partials/delete',
      controller: 'Deleter'
    })

    $router.when('/manage/profile', { 
      templateUrl: '/partials/profile',
      controller: 'Profiler'
    })

    $location.html5Mode(true)
  }]).
  directive('setHeight', function () {
    return function (scope, element, attrs) {
      scope.$watch('p', function () {
        var chars = this.last.split('').length

        $(element[0]).css('height', ((chars / 40 + 1.2) * .95) + 'em')
      })
    }
  })

function setHeight(scope) {
  var chars = $(scope).val().split('').length

  $(scope).css('height', (Math.floor(chars / 40 + 1.2) * .95) + 'em')
}

$.urlParam = function(name){
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  return results !== null ? results[1] : null;
}

var callback = {
  facebook : 'api.singly.com%2Fauth%2Ffacebook%2Fauth%2F7fbf36f4dfc8aae58d6748d9855b8b65',
  twitter  : 'narratio.bsgbryan.com'
}

$(function () {
  $('#post').on('change', '.editor .content', function () {
    setHeight(this)
  })

  $('#post').on('keyup', '#new ng-include textarea', function () {
    setHeight(this)
  })

  $('#post').on('click', '#contexts label', function () {
    $(this).toggleClass('selected')
    return false
  })

  $('#post').on('click', '.editor .update', function () {
    console.log('clicked update', $(this).parent())
    $(this).parent().trigger('submit')
    return false
  })

  $('#aioim').on('click', '#new-message .services .icon', function () {
    $(this).toggleClass('selected')
    return false
  })

  $('#aioim').on('click', '#new-message .publish', function () {
    aioim.new_message($('#new-message textarea').val(), $.cookie('user_id'))

    return false
  })

  $('#post').on('click', '#posts:not(.private) a', function () {
    var context = $(this).parents('#posts').attr('class')

    $('#services .' + context + ' .last-read').
      text($(this).text()).
      attr('href', $(this).attr('href'))
  })

  if (typeof $.cookie('token') === 'undefined') {
    $('#actions').hide()
    $('#login').show()
  } else {
    $('#actions').show()
    $('#login').hide()
  }

  var token = $.urlParam('access_token')

  if (token !== null)
    $.cookie('token', token)

  $('#login a').on('click', function () {
    var mode = $(this).attr('class')
    var href = 'https://api.singly.com/oauth/authenticate?' +
      'client_id=7fbf36f4dfc8aae58d6748d9855b8b65&' +
      'service=' + mode + '&' +
      'redirect_uri=https%3A%2F%2F' + callback[mode] + '&' +
      'scope=email&' +
      'response_type=token'

    if (typeof $.cookie('token') === 'string')
      href += '&access_token=' + $.cookie('token')

    $(this).
      attr('href', href).
      trigger('click')
  })

  $('#post').on('click', '#synced .service .icon', function () {
    var mode = $(this).attr('data-service')
    var href = 'https://api.singly.com/oauth/authenticate?' +
      'client_id=7fbf36f4dfc8aae58d6748d9855b8b65&' +
      'service=' + mode + '&' +
      'redirect_uri=https%3A%2F%2F' + callback[mode] + '&' +
      'scope=email&' +
      'response_type=token'

    if (typeof $.cookie('token') === 'string')
      href += '&access_token=' + $.cookie('token')

    $(this).
      attr('href', href).
      trigger('click')
  })

})