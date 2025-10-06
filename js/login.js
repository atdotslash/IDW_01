const formLogin = document.getElementById("formLogin");
const inputUser = document.getElementById("user");
const inputPass = document.getElementById("pass");

const login = (e) => {
  e.preventDefault();
  if (inputUser.value.trim() === "admin" && inputPass.value === "1234") {
    window.location.replace("admin-index.html");
  } else {
    formLogin.insertAdjacentHTML("afterbegin", '<p class="text-danger">Usuario y/o Password Incorrectos</p>');
  }
};

formLogin.addEventListener("submit", login);
