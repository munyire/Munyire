npm run dev

> munyire@1.0.0 dev
> concurrently "npm run dev --prefix backend" "npm run dev --prefix frontend"

[0] 
[0] > munyire-backend@0.1.0 dev
[0] > nodemon app.js
[0]
[1]
[1] > frontend@0.0.0 dev
[1] > vite
[1]
[0] [nodemon] 3.1.11
[0] [nodemon] to restart at any time, enter `rs`
[0] [nodemon] watching path(s): *.*
[0] [nodemon] watching extensions: js,mjs,cjs,json
[0] [nodemon] starting `node app.js`
[0] C:\Users\gynor\Desktop\Suli\Munyire\backend\node_modules\lodash\lodash.js:1
[0]
[0]
[0]
[0] SyntaxError: Invalid or unexpected token
[0]     at wrapSafe (node:internal/modules/cjs/loader:1692:18)
[0]     at Module._compile (node:internal/modules/cjs/loader:1735:20)
[0]     at Object..js (node:internal/modules/cjs/loader:1893:10)
[0]     at Module.load (node:internal/modules/cjs/loader:1481:32)
[0]     at Module._load (node:internal/modules/cjs/loader:1300:12)
[0]     at TracingChannel.traceSync (node:diagnostics_channel:328:14)
[0]     at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
[0]     at Module.require (node:internal/modules/cjs/loader:1504:12)
[0]     at require (node:internal/modules/helpers:152:16)
[0]     at Object.<anonymous> (C:\Users\gynor\Desktop\Suli\Munyire\backend\node_modules\sequelize\lib\sequelize.js:25:11)
[0]
[0] Node.js v24.11.1
[0] [nodemon] app crashed - waiting for file changes before starting...
[1] 
[1]   VITE v7.3.0  ready in 357 ms
[1]
[1]   ➜  Local:   http://localhost:5173/
[1]   ➜  Network: use --host to expose
