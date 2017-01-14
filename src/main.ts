import { sayHello } from "./greet";

console.log(sayHello(process.argv[2] || "TypeScript"));