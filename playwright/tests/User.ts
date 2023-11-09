export class User {
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  // Static method to generate a random user with a minimum of 5 characters for username and password
  static random() {
    // Generate a random number and pad it to ensure it's at least 5 characters long
    const randomNumber = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
    const username = `user${randomNumber}`;
    const password = `pass${randomNumber}`;
    return new User(username, password);
  }
}

// Generate a random user and export it
export const sharedUser = User.random();
