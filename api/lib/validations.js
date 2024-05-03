export const validateUsername = (username) => {
  // Username should be between 3 and 20 characters and can contain letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

export const validatePassword = (password) => {
  // Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return passwordRegex.test(password);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const pswErrMsg =
  "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit";
