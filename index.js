require('dotenv').config();

const foo = { foo: 'foo' };
const bar = { bar: 'bar' };
const fooBar = { ...foo, ...bar };

console.log(fooBar);
console.log(process.env.GITHUB_PERSONAL_ACCESS_TOKEN);
