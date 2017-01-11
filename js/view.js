var vueApp = new Vue({
    el: '#app',
    data: {
        firebaseApp: false,
        firebaseConfig: {
            apiKey: "AIzaSyDBnNrUk-iyqi-iq8faT3rW4t9PGZcduIQ",
            authDomain: "kwot-4f92f.firebaseapp.com",
            databaseURL: "https://kwot-4f92f.firebaseio.com",
            storageBucket: "kwot-4f92f.appspot.com",
            messagingSenderId: "495914858617"
        },
        isLoggedIn: false,
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
            request.send();
            return request;
        },
        getFacebookComments: function(token) {
            var url = "https://graph.facebook.com/v2.8/me/feed?&access_token=" + token;
            var request = this.getRequest(url);
            if (request.status == 200) {
                var posts = JSON.parse(request.responseText);
                this.posts = posts.data;

                for (var i = 0; i < this.posts.length; i++) {
                    var post = this.posts[i];
                    var commentsUrl = "https://graph.facebook.com/v2.8/" + post.id + "/comments?&access_token=" + token;
                    var commentsRequest = this.getRequest(commentsUrl);

                    if (commentsRequest.status == 200) {
                        var comments = JSON.parse(commentsRequest.responseText);
                        post.comments = comments.data;

                        for (var y = 0; y < post.comments.length; y++) {
                            var comment = post.comments[y];


                            var watsonUrl = "https://gateway-a.watsonplatform.net/calls/text/TextGetTextSentiment?apikey=d5dbbfa0e237deb3e2e03242d4c5a3c6434b0946&text=" + encodeURIComponent(this.removeDiacritics(comment.message)) + "&outputMode=json"
                            var watsonRequest = this.getRequest(watsonUrl);

                            if (watsonRequest.status == 200) {
                                comment.watson = JSON.parse(watsonRequest.responseText);
                                if (comment.watson.docSentiment) {
                                    if (comment.watson.docSentiment.type == "negative") {
                                        if (post.negative == undefined) {
                                            post.negative = 0;
                                        }
                                        post.negative++;
                                    } else if (comment.watson.docSentiment.type == "positive") {
                                        if (post.positive == undefined) {
                                            post.positive = 0;
                                        }
                                        post.positive++;
                                    } else {
                                        if (post.neutral == undefined) {
                                            post.neutral = 0;
                                        }
                                        post.neutral++;
                                    }
                                }
                            }
                        }
                    }
                }

                console.log(this.posts);

            }
        },
        signOut: function() {
            var vm = this;
            this.firebaseApp.auth().signOut().then(function() {
                console.log('Signed Out');
                vm.isLoggedIn = false;
            }, function(error) {
                console.error('Sign Out Error', error);
            });
        },
        removeDiacritics: function(str) {
            return str.replace(/!./g);
        }
    },
    mounted: function() {
        this.firebaseApp = firebase.initializeApp(this.firebaseConfig);
        var vm = this;
        this.firebaseApp.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log('user signed in', user);
                vm.isLoggedIn = true;
                console.log(localStorage.getItem('facebookToken'));
                if (localStorage.getItem('facebookToken') != null) {
                    var token = localStorage.getItem('facebookToken');
                    vm.getFacebookComments(token);
                }
            } else {
                console.log('user not signed in');
            }
        });
    }
})
