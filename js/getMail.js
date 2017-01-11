var vueApp = new Vue({
    el: '#app',
    data: {
        firebaseApp: false,
        database: false,
        mailUser:'',
        error:false,
        success:false
    },
    methods: {
        registerMail: function() {
        	if(this.validateEmail(this.mailUser)){
	            this.database.ref('landing/').push({
	                mail: this.mailUser
	            });
	            this.error = false;
	            this.success = true;
            }else{
            	this.error = "Veuillez entrer un mail valide";
            }
        },
		validateEmail : function(email) {
		    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		    return re.test(email);
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
        
    }
})
