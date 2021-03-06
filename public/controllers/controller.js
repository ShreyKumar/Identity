var myApp = angular.module('myApp', []);

myApp.controller('AppCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    
    console.log("Hello world from controller");

    
    $scope.load_user = function(){
        if(window.location.pathname == '/main.html'){
            console.log("Hello world!");
            $scope.user = localStorage.getItem("user");
        }
    }
    
    var refresh = function(){
        console.log($scope.user);
        $http.get('/identity/' + $scope.user).success(function(response){
            $scope.contactlist = response.contacts;
        });
    }
    $scope.load_user();
    refresh();
    
    $scope.addContact = function() {
        console.log($scope.contact);
        var eval = /^[A-Z]'?[-. a-zA-Z]+$/.test($scope.contact.name) && /^[0-9]+$/.test($scope.contact.number) && /[a-zA-Z0-9.]+@([a-z]{2,}\.)*[a-z]{2,}/.test($scope.contact.email);
        
        if(eval){
            $http.post('/identity/' + $scope.user, $scope.contact).success(function(response){
                console.log(response);
                refresh();
                $scope.contact = undefined;
            });
        }
    };
    
    $scope.remove = function(name, email, number){
        $scope.test = {'contacts' : 'hey'};
        $http.post("/identity/" + $scope.user + "/" + name + '/' + email + '/' + number, $scope.contactlist).success(function(response){
            console.log(response);
            refresh();
        });
    }
    
    $scope.edit = function(name, email, number) {
        $scope.contact = {name: "", email: "", number: ""};
        
        $scope.contact.name = name;
        localStorage.setItem("name", name);
        $scope.contact.email = email;
        localStorage.setItem("email", email);
        $scope.contact.number = number;
        localStorage.setItem("number", number);
    }; 
    
    $scope.update = function(){
        var eval = /^[A-Z]'?[-. a-zA-Z]+$/.test($scope.contact.name) && /^[0-9]+$/.test($scope.contact.number) && /[a-zA-Z0-9.]+@([a-z]{2,}\.)*[a-z]{2,}/.test($scope.contact.email);
        if(eval){
            $scope.send = {new: $scope.contact, list: $scope.contactlist};
            console.log('validated');
            console.log($scope.contactlist);
            $http.put('/identity/' + $scope.user + '/' + localStorage.getItem("name") + '/' + localStorage.getItem("email") + '/' + localStorage.getItem("number"), [$scope.contactlist, $scope.contact]).success(function(response){
                console.log(response);
                refresh();
                $scope.contact = {name: "", email: "", number: ""};
            });
        } else {
            console.log('failed');   
        };
    }
    
    $scope.deselect = function(){
        $scope.contact = "";
    };
    
    $scope.reset_signup = function(){
        $scope.signup = undefined;
        $scope.signup_confirmpwd = undefined;
        $scope.ans = undefined;
    }
    
    $scope.go_signup = function(){
        //check for completed fields
        var isEmpty = $scope.signup === undefined || $scope.signup.username === undefined || $scope.signup.password === undefined || $scope.signup_confirmpwd === undefined || $scope.ans === undefined;
        if(isEmpty){
            $scope.signup_msg = "Please fill in all fields";
            $scope.reset_signup();
        } else if($scope.signup.username.length < 5 || $scope.signup.password.length < 5){
            $scope.signup_msg = "Username and password both have to be 5 characters or more";
            $scope.reset_signup();
        } else if(!/^[a-zA-Z0-9äöüÄÖÜ]*$/.test($scope.signup.username)){
            $scope.signup_msg = "Username must only contain uppercase, lowercase or integers";
            $scope.reset_signup();
        } else if($scope.signup.password != $scope.signup_confirmpwd){
            $scope.signup_msg = "Passwords do not match. Please try again.";
            $scope.reset_signup();
        } else if($scope.ans != '7'){
            $scope.signup_msg = "5 + 2 isn't " + $scope.ans;
            $scope.reset_signup();
        } else {
            $http.get('/identity/' + $scope.signup.username).success(function(response){
                if(response !== null && $scope.signup.username == response.username){
                    $scope.signup_msg = "Username taken. Please pick another";
                    $scope.reset_signup();
                } else {
                    $http.post('/identity/' + $scope.signup.username + '/' + $scope.signup.password).success(function(response){
                        console.log('User added');
                    });
                    console.log("Authentication complete");
                    localStorage.setItem("user", $scope.signup.username);
                    window.location.href = "main.html";
                }
            });   
        }
    }
    
    $scope.check = function(){
        if(localStorage.hasOwnProperty('expirydate')){
            //check if today's date exceeds expiry date
            var expdate = localStorage.getItem('expirydate');
            var date = new Date();
            if(parseInt(expdate.substring(0, 2)) > date.getDate() || parseInt(expdate.substring(3, 5)) > date.getMonth() || parseInt(expdate.substring(5, 9)) > date.getFullYear){
                $scope.user = localStorage.getItem("user");
                window.location.href = "main.html";
            };
        }
    }
    
    $scope.getExpDate = function(){
        if(document.getElementById('remember').checked){
            var date = new Date();
            var month = date.getMonth();
            var day = date.getDate();
            var year = date.getFullYear();
            if(month % 2 == 0){
                var limit = 31;
            } else {
                var limit = 30;   
            }
            day += 14;
            if(day > limit){
                day -= limit;
                month += 1
                if(month > 12){
                    year += 1;
                    month = 0;
                }
            }
                        var expdate = day + '/' + month + '/' + year;
                        localStorage.setItem("password", $scope.signin.password);
                        localStorage.setItem("expirydate", expdate);    
            }
    }
    
    $scope.go_signin = function(){
        if($scope.signin === undefined || $scope.signin.username === undefined || $scope.signin.password === undefined){
            $scope.signin_msg = "Some of your fields are empty. Please try again.";
            $scope.signin = undefined;
            console.log($scope.signin);
        } else {
            $http.get('/identity/' + $scope.signin.username + '/' + $scope.signin.password).success(function(response){
                console.log(response === null);
                if(response === null){
                    $scope.signin_msg = "Username or Password not found.";
                    $scope.signin = undefined;
                    console.log($scope.signin);
                } else {
                    //remember me value
                    $scope.getExpDate();
                    console.log("Authentication complete");
                    localStorage.setItem("user", response.username);
                    window.location.href = "main.html";
                }
            });
        }
    }
    
    $scope.signout = function(){
        localStorage.setItem("user", "");
        localStorage.setItem("expirydate", "");
        window.location.href = "index.html";
    }
    

    
}]);