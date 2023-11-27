## Fantata Socket Set
A simple websocket library with client and server components & message acknowledgment / resend. Still a work in progress, so may have bugs and this readme may not be comprehensive.

### Installation
```
npm i fantata-socket-set
```

### Usage
Import the library server side:
```
import SocketSet from 'fantata-socket-set';
```

Include the cient side script:
```
<script type="module" src="/browser/browser.mjs"></script>
```

Initialise the service:
```
SocketSet.init(server);
```

Add your node event listeners:
```
SocketSet.addListener('yourCode', data => {
  // do stuff here
});
```

Send messages client side:
```
window.addEventListener("socketSetLoaded", function(e) {
    
    const app = e.detail;

    app.wsSend({
        "type": "newGame"
    });

});
```