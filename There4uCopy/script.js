document.getElementById('LogIn').addEventListener("click", function () {
    window.location.href="LogIn.html";
});

document.getElementById('CreateAccount').addEventListener("click", function () {
    window.location.href="CreateAccount.html";
    document.getElementById("CreateAccountBtn").addEventListener("click", function() {
        event.preventDefault();
       
        const doneeChecked = document.getElementById("donee").checked;
        const contributorChecked = document.getElementById("contributor").checked;
    
        if (doneeChecked) {
            window.location.href = "Donee.html"; 
        } else if (contributorChecked) {
            window.location.href = "Contributor.html"; 
        } else {
            alert("Please select a profile type.");
        }
    }); 
});