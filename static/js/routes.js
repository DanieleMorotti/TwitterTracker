import mainComp from '/static/js/comp_main.js'
import searchComp from '/static/js/comp_search.js'
import tweetComp from '/static/js/comp_tweets.js'
import mapComp from '/static/js/comp_map.js'
//import collectionsComp from '/static/js/comp_collections.js'
import cloudComp from '/static/js/comp_cloud.js'
import graphsComp from '/static/js/comp_graphs.js'

export const router = new VueRouter({
    routes: [
      {path: '/',             component: mainComp       },
      {path: '/search',       component: searchComp     },
      {path: '/tweets',       component: tweetComp      },
      {path: '/map',          component: mapComp        },
  //    {path: '/collections',  component: collectionsComp},
      {path: '/cloud',        component: cloudComp      },
      {path: '/graphs',       component: graphsComp     },
    ],
  })


router.beforeEach((to, from, next) => {
    if(to.path === '/search') {
      $('#stylesheetComp').attr('href','/static/css/search.css');
    }
    else if(to.path === '/tweets') {
      $('#stylesheetComp').attr('href','/static/css/tweets.css');
    }
    else if (to.path === '/map') {
      $('#stylesheetComp').attr('href','/static/css/map.css');
    }
   /* else if (to.path === '/collections') {
      $('#stylesheetComp').attr('href','/static/css/collections.css');
    } */
    else if (to.path === '/cloud') {
        $('#stylesheetComp').attr('href', '/static/css/cloud.css');
    }
    else if (to.path === '/graphs') {
        $('#stylesheetComp').attr('href', '/static/css/graphs.css');
    }

    next();
})


new Vue({
    router: router,
    el: '#app', 
})