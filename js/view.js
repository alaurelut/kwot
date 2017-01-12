var vueApp = new Vue({
    el: '#app',
    data: {
        firebaseApp: false,
        database: false,
        user: false,
        posts: []
    },
    methods: {
        login: function(authMethod) {

            var vm = this;

            switch (authMethod) {
                case "google":
                    var authProvider = new firebase.auth.GoogleAuthProvider();
                    authProvider.addScope('https://www.googleapis.com/auth/plus.login');
                    break;
                case "facebook":
                    var authProvider = new firebase.auth.FacebookAuthProvider();
                    authProvider.addScope('user_posts');
                    break;
                case "twitter":
                    var authProvider = new firebase.auth.TwitterAuthProvider();
                    break;
            }

            if (vm.firebaseApp) {
                vm.firebaseApp
                    .auth()
                    .signInWithPopup(authProvider)
                    .then(
                        function(result) {
                            var credential = result.credential;
                            var user = result.user;
                            vm.user = user;
                            // Get reference to the currently signed-in user
                            var prevUser = vm.firebaseApp.auth.currentUser;
                            // Sign in user with another account
                            vm.firebaseApp.auth().signInWithCredential(credential).then(function(user) {
                                console.log("Sign In Success", user);
                                var currentUser = user;
                                if (authMethod == "facebook") {
                                    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                                    var token = result.credential.accessToken;
                                    localStorage.setItem('facebookToken', token);
                                }
                            }, function(error) {
                                alert("Sign In Error", error);
                            });
                        });
            }
        },
        getRequest: function(url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);
            return request;
        },
        getFacebookComments: function(token) {
            var vm = this;
            var url = "https://graph.facebook.com/v2.8/me/feed?&access_token=" + token;
            var feedRequest = this.getRequest(url);
            feedRequest.onreadystatechange = function() {
                if (feedRequest.status == 200) {
                    var posts = JSON.parse(feedRequest.responseText);
                    posts = posts.data;
                    for (var i = 0; i < posts.length; i++) {
                      if (posts[i].message && vm.posts.length < 5) {
                        vm.posts = posts.push(posts[i]);
                      }
                    }
                    for (var i = 0; i < vm.posts.length; i++) {
                        var post = vm.posts[i];
                        post.comments = [];
                        var commentsUrl = "https://graph.facebook.com/v2.8/" + post.id + "/comments?&access_token=" + token;
                        var commentsRequest = vm.getRequest(commentsUrl);
                        commentsRequest.onreadystatechange = function() {
                            console.log('commentsRequest', commentsRequest);

                            if (commentsRequest.status == 200) {
                                var comments = JSON.parse(commentsRequest.responseText);
                                console.log('comments', comments);
                                post.comments = comments.data;

                                for (var y = 0; y < post.comments.length; y++) {
                                    var comment = post.comments[y];
                                    var watsonUrl = "https://gateway-a.watsonplatform.net/calls/text/TextGetTextSentiment?apikey=d5dbbfa0e237deb3e2e03242d4c5a3c6434b0946&text=" + encodeURIComponent(vm.removeDiacritics(comment.message)) + "&outputMode=json"
                                    var watsonRequest = vm.getRequest(watsonUrl);
                                    watsonRequest.onreadystatechange = function() {
                                      if (watsonRequest.status == 200) {
                                          comment.watson = JSON.parse(watsonRequest.responseText);
                                          if (comment.watson.docSentiment) {
                                              if (post[comment.watson.docSentiment.type] == undefined) {
                                                  post[comment.watson.docSentiment.type] = 0;
                                              }
                                              post[comment.watson.docSentiment.type]++;
                                          }
                                      }
                                    }
                                    watsonRequest.send();
                                }
                            }
                        }
                        commentsRequest.send();
                    }
                    vm.writePostData(vm.user.uid, vm.posts);
                    console.log('mdr', vm.posts);
                }
            }
            feedRequest.send();
        },
        writePostData: function(userId, posts) {
            this.database.ref('users/' + userId).set({
                posts: posts
            });
        },
        getUserPosts: function(userId) {
            return this.database.ref('/users/' + userId).once('value');
        },
        signOut: function() {
            var vm = this;
            this.firebaseApp.auth().signOut().then(function() {
                vm.user = false;
            }, function(error) {
                console.error('Sign Out Error', error);
            });
        },
        removeDiacritics: function(str) {
            return str.replace(/!./g);
        }
    },
    mounted: function() {
        var firebaseConfig = {
            apiKey: "AIzaSyDBnNrUk-iyqi-iq8faT3rW4t9PGZcduIQ",
            authDomain: "kwot-4f92f.firebaseapp.com",
            databaseURL: "https://kwot-4f92f.firebaseio.com",
            storageBucket: "kwot-4f92f.appspot.com",
            messagingSenderId: "495914858617"
        };
        this.firebaseApp = firebase.initializeApp(firebaseConfig);
        // Get a reference to the database service
        this.database = this.firebaseApp.database();

        var vm = this;
        this.firebaseApp.auth().onAuthStateChanged(function(user) {
            if (user) {
                vm.user = user;
                console.log(user);
                var promise = vm.getUserPosts(vm.user.uid);
                promise.then(function(data) {
                    if (data.val() != null) {
                        vm.posts = data.val().posts;
                    }

                    if (localStorage.getItem('facebookToken') != null) {
                        var token = localStorage.getItem('facebookToken');
                        vm.getFacebookComments(token);
                    }
                });

            }
        });
    }
});


Vue.component('chart', {
    // declare the props
    props: ['post'],
    mounted: function() {
        console.log('chart mounted', this.post);

        var positiveScore = 100 * this.post.positive / this.post.comments.length;
        var negativeScore = 100 * this.post.negative / this.post.comments.length;
        var neutralScore = 100 * this.post.neutral / this.post.comments.length;

        var ctx = document.getElementById("chart-" + this.post.id);
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Negatif", "Positif", "Neutre"],
                maintainAspectRatio: true,
                datasets: [{
                    label: 'Commentaires',
                    data: [negativeScore, positiveScore, neutralScore],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    },
    // just like data, the prop can be used inside templates
    // and is also made available in the vm as this.message
    template: '<canvas v-bind:id="\'chart-\' + post.id" width="400" height="400"></canvas>'
})
