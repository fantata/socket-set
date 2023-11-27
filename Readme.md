## Fantata Socket Set
A simple websocket library with client and server components & message acknowledgment / resend.

### Installation
npm i fantata-socket-set

### Usage
Import the library server side:
```
import SocketSet from 'socket-set';
```

Include the cient side script:
```
<script type="module" src="/browser/browser.mjs"></script>
```

Initialise the service:
```
SocketSet.init(server);
```

Add your event listeners:
```
SocketSet.addListener('yourCode', data => {
  // do stuff here
});
```