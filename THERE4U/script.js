const logInBtn = document.getElementById('LogIn');
if (logInBtn) {
    logInBtn.addEventListener("click", function () {
        window.location.href = "LogIn.html";
    });
}

const createAccountBtn = document.getElementById('CreateAccount');
if (createAccountBtn) {
    createAccountBtn.addEventListener("click", function () {
        window.location.href = "CreateAccount.html";
    });
}

const aboutUsBtn = document.getElementById('AboutUs');
    if(aboutUsBtn) {
    aboutUsBtn.addEventListener("click", function () {
        window.location.href = "AboutUs.html";
    });
}

const doneeBtn = document.getElementById('donee');
if (doneeBtn) {
    doneeBtn.addEventListener("click", function () {
        window.location.href = "Donee.html";
    });
}

const contributorBtn = document.getElementById('contributor');
if (contributorBtn) {
    contributorBtn.addEventListener("click", function () {
        window.location.href = "Contributor.html";
    });
}