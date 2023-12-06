export class Group {
    name: string;
    users: string[];

    constructor(name: string, users: string[] = []) {
      this.name = name;
      this.users = users;
    }

    // Static method to generate a random group name
    static randomName() {
        const randomPart = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        return `GroupTEST${randomPart}`;
    }

    // Method to add a user to the group
    addUser(user: string) {
      this.users.push(user);
    }
}

// Usage
export const myGroup = new Group(Group.randomName());