// UrbanChimney Login Validation

document.getElementById("loginForm").addEventListener("submit", function(e){

e.preventDefault();

let name = document.getElementById("name").value.trim();
let mobile = document.getElementById("mobile").value.trim();
let city = document.getElementById("city").value;

if(name==""){
alert("Please enter your name");
return;
}

if(!/^[0-9]{10}$/.test(mobile)){
alert("Please enter a valid 10 digit mobile number");
return;
}

if(city==""){
alert("Please select your city");
return;
}

// Save customer details

localStorage.setItem("customerName",name);
localStorage.setItem("customerMobile",mobile);
localStorage.setItem("customerCity",city);

// Open Home Page

window.location.href="home.html";

});
