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

            for (var i = 0; i < vm.posts.length; i++) {
                var post = vm.posts[i];
                // post.comments = [];
                var commentsUrl = "https://graph.facebook.com/v2.8/" + post.id + "/comments?&access_token=" + token;
                var commentsRequest = vm.getRequest(commentsUrl);
                commentsRequest.onreadystatechange = function() {
                    if (commentsRequest.status == 200) {
                        var commentsReturn = JSON.parse(commentsRequest.responseText);
                        // post.comments = comments.data;
                        var comments = commentsReturn.data;

                        for (var y = 0; y < comments.length; y++) {
                            var comment = comments[y];
                            if (!vm.isCommentPresentInPostAlready(post, comment)) {
                                // var watsonUrl = "https://gateway-a.watsonplatform.net/calls/text/TextGetTextSentiment?apikey=d5dbbfa0e237deb3e2e03242d4c5a3c6434b0946&text=" + encodeURIComponent(vm.removeDiacritics(comment.message)) + "&outputMode=json"
                                var watsonUrl = "https://gateway-a.watsonplatform.net/calls/text/TextGetCombinedData?apikey=d5dbbfa0e237deb3e2e03242d4c5a3c6434b0946&text=" + encodeURIComponent(vm.removeDiacritics(comment.message)) + "&outputMode=json&sentiment=1&extract=keywords,doc-sentiment";
                                var watsonRequest = vm.getRequest(watsonUrl);
                                watsonRequest.onreadystatechange = function() {
                                    if (watsonRequest.status == 200) {
                                        var watson = JSON.parse(watsonRequest.responseText);
                                        if (watson.docSentiment) {
                                            if (post[watson.docSentiment.type] == undefined) {
                                                post[watson.docSentiment.type] = 0;
                                            }
                                            post[watson.docSentiment.type]++;
                                            if (post.comments == undefined) {
                                                post.comments = [];
                                            }
                                            post.comments.push(comment);

                                            if (post.keywords == undefined) {
                                                post.keywords = [];
                                            }
                                            if (watson.keywords.length > 0) {
                                                post.keywords.push(watson.keywords[0]);
                                            }
                                        }
                                    }
                                }
                                watsonRequest.send();
                            }
                        }
                        vm.writePostData(vm.user.uid, vm.posts);
                    }
                }
                commentsRequest.send();
            }
        },
        isCommentPresentInPostAlready: function(post, comment) {
            var isPresent = false;
            if (post.comments != undefined) {
                post.comments.forEach(function(postComment) {
                    if (comment.id == postComment.id) {
                        isPresent = true;
                        return false;
                    }
                });
            }
            return isPresent;
        },
        getFacebookPosts: function(token) {
            var vm = this;
            var url = "https://graph.facebook.com/v2.8/me/feed?limit=5&access_token=" + token;
            var feedRequest = this.getRequest(url);
            feedRequest.onreadystatechange = function() {
                if (feedRequest.status == 200) {
                    var posts = JSON.parse(feedRequest.responseText);
                    posts = posts.data;
                    for (var i = 0; i < posts.length; i++) {
                        if (posts[i].message) {


                            var sharePostUrl = "https://graph.facebook.com/v2.8/" + posts[i].id + "/sharedposts?&access_token=" + token;
                            var sharePostRequest = vm.getRequest(sharePostUrl);
                            sharePostRequest.onreadystatechange = function() {
                                if (sharePostRequest.status == 200) {
                                    var shared = JSON.parse(sharePostRequest.responseText);
                                    posts[i].shared = shared.data;
                                    vm.posts.push(posts[i]);
                                }
                            }
                            sharePostRequest.send();


                        }
                    }
                    console.log('write post to db', vm.posts);
                    vm.writePostData(vm.user.uid, vm.posts);
                    vm.getFacebookComments(token);
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
        filterKeywords: function(keywords) {
            var array = keywords.slice().sort(function(a, b) {
              return parseFloat(b.relevance) - parseFloat(a.relevance );
            });
            return array.splice(0,3);
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

                if (localStorage.getItem('facebookToken') != null) {
                    var token = localStorage.getItem('facebookToken');
                }

                promise.then(function(data) {
                    if (data.val() != null) {
                        vm.posts = data.val().posts;
                        vm.getFacebookComments(token);
                    } else {
                        console.log('no post in DB');
                        vm.getFacebookPosts(token);
                    }
                });
            }
        });
    }
});


Vue.component('chart', {
    // declare the props
    props: ['post'],
    data: function() {
        return {
            positiveScore: 0,
            negativeScore: 0,
            neutralScore: 0
        }
    },
    methods: {
        createChart: function(type, percentage) {
            var ctx = document.getElementById("chart-" + this.post.id + "-" + type);
            var myChart = new Chart(ctx, {
                type: 'doughnut',
                options: {
                    cutoutPercentage: 75,
                    title: {
                        display: true,
                        text: type,
                        fontSize: 18,
                        fontFamily: 'Raleway, sans-serif',
                        fontColor: '#28ADAD',
                        fontStyle: 'ligth',
                        position: 'bottom'
                    }
                },
                data: {
                    maintainAspectRatio: true,
                    datasets: [{
                        label: type,
                        data: [percentage, 100 - percentage],
                        backgroundColor: [
                            "#28ADAD",
                            "#EEECEE"
                        ]
                    }]
                }
            });
        }
    },
    mounted: function() {
        console.log('mounted', this.post);
        if (this.post.positive == undefined) {
            this.post.positive = 0;
        }
        if (this.post.negative == undefined) {
            this.post.negative = 0;
        }
        if (this.post.neutral == undefined) {
            this.post.neutral = 0;
        }
        this.positiveScore = Math.round(100 * this.post.positive / this.post.comments.length);
        this.negativeScore = Math.round(100 * this.post.negative / this.post.comments.length);
        this.neutralScore = Math.round(100 * this.post.neutral / this.post.comments.length);

        this.createChart("positive", this.positiveScore);
        this.createChart("negative", this.negativeScore);
        this.createChart("neutral", this.neutralScore);
    },
    template: '#charts'
})
