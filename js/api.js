const FAKE_CREDENTIALS = {
  username: "admin",
  password: "1234"
}

export const api = {
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === FAKE_CREDENTIALS.username && password === FAKE_CREDENTIALS.password) {
          resolve({ success: true });
        } else {
          reject({ success: false, message: "Usuario y/o Password Incorrectos" });
        }
      }, 500);
    });
  }
};
