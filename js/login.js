// Initialize Firebase
var firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyDBnNrUk-iyqi-iq8faT3rW4t9PGZcduIQ",
    authDomain: "kwot-4f92f.firebaseapp.com",
    databaseURL: "https://kwot-4f92f.firebaseio.com",
    storageBucket: "kwot-4f92f.appspot.com",
    messagingSenderId: "495914858617"
});

// Initialize Facebook
window.fbAsyncInit = function() {
    FB.init({
        appId: '356243101416513',
        xfbml: true,
        version: 'v2.8'
    });
    FB.AppEvents.logPageView();
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function login(authMethod) {
    switch (authMethod) {
        case "google":
            var authProvider = new firebase.auth.GoogleAuthProvider();
            authProvider.addScope('https://www.googleapis.com/auth/plus.login');
            break;
        case "facebook":
            var authProvider = new firebase.auth.FacebookAuthProvider();
            break;
        case "twitter":
            var authProvider = new firebase.auth.TwitterAuthProvider();
            break;
    }

    firebaseApp
        .auth()
        .signInWithPopup(authProvider)
        .then(
            function(result) {
                if (authMethod == "facebook") {
                    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                    var token = result.credential.accessToken;

                    var url = "https://graph.facebook.com/v2.8/me/feed?&access_token=" + token;

                    var req = new XMLHttpRequest();
                    req.open('GET', url, false);
                    req.send(null);
                    if(req.status == 200)
                      console.log(req.responseText);

                    // FB.api(
                    //     "/me/feed",
                    //     function (response) {
                    //       console.log('feed facebook');
                    //       console.log(response);
                    //       if (response && !response.error) {
                    //         /* handle the result */
                    //       }
                    //     }
                    // );
                }

                var credential = result.credential;
                var user = result.user;

                // Get reference to the currently signed-in user
                var prevUser = firebaseApp.auth.currentUser;
                // Sign in user with another account
                firebaseApp.auth().signInWithCredential(credential).then(function(user) {
                    console.log("Sign In Success", user);
                    console.log(firebaseApp.auth().currentUser);
                    var currentUser = user;
                }, function(error) {
                    alert("Sign In Error", error);
                });
            })
}
