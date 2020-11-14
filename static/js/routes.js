
import searchComp from '/static/js/search.js'
import tweetComp from '/static/js/tweet.js'
import mapView from '/static/js/map_view.js'

const router = new VueRouter({
    routes: [
      {path: '/search', component: searchComp},
      {path: '/tweets', component: tweetComp},
      {path: '/map_view', component: mapView}
    ],
  })


router.beforeEach((to, from, next) => {
    if(to.path === '/search') {
      $('#stylesheetComp').attr('href','/static/css/search.css');
    }
    else if(to.path === '/tweets') {
      $('#stylesheetComp').attr('href','/static/css/tweet.css');
    }
    else if (to.path === '/map_view') {
      $('#stylesheetComp').attr('href','/static/css/map_view.css');
    }
    next();
})


new Vue({
    router: router,
    el: '#app', 
})