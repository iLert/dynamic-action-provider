const Service = require("./src/Service.js");
const service = new Service({
    port: 8087
});
service.run().catch(console.error);