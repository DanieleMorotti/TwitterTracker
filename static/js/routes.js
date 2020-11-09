
import searchComp from '/static/js/search.js'
import tweetComp from '/static/js/tweet.js'

const router = new VueRouter({
    routes: [
      {path: '/search', component: searchComp},
      {path: '/tweets', component: tweetComp}
    ],
  })


router.beforeEach((to, from, next) => {
    if(to.path === '/search') {
      $('#stylesheetComp').attr('href','/static/css/search.css');
    }
    else if(to.path === '/tweets') {
      $('#stylesheetComp').attr('href','/static/css/tweet.css');
    }
    next();
})


new Vue({
    router: router,
    el: '#app', 
})