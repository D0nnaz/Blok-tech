// const usersCollection = client.db().collection('users');
// const users = [
//   { username: 'Deniz', password: '1234' },
//   { username: 'Mila', password: '1234' },
//   { username: 'Mohini', password: '1234' },
//   { username: 'Nina', password: '1234' },
//   { username: 'Ivo', password: '1234' }
// ];
// for (const user of users) {
//   const result = await usersCollection.findOne({ username: user.username });
//   if (!result) {
//     await usersCollection.insertOne(user);
//     console.log(`User -> ${user.username} naar MongoDB`);
//   }
// }
