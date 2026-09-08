let users = [];

const User = {
  findByEmail: (email) => users.find((user) => user.email === email),
  create: (userData) => {
    const newUser = { id: users.length + 1, ...userData };
    users.push(newUser);
    return newUser;
  },
  clear: () => {
    users = [];
  }
};

module.exports = User;
