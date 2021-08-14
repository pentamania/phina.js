# phina.js

![image](logo.png)

Fork of phina.js by pentamania.

## Official

https://phinajs.com

## Usage

### Install

```bash
npm i phina.js@npm:@pentamania/phina
```

### Example

```js
import {
  phina,
  GameApp,
  DisplayScene,
  TriangleShape,
} from "../../../build/phina.esm.js";

/**
 * MainScene
 */
window.MainScene = class extends DisplayScene {
  constructor(options) {
    super(options);
    const gx = this.gridX;
    const gy = this.gridY;

    this.player = new TriangleShape()
      .setScale(2)
      .setPosition(gx.center(), gy.center())
      .addChildTo(this);
  }

  update(app) {
    const p = app.pointer;
    const kb = app.keyboard;
    if (p.getPointingStart()) {
      this.player.setPosition(p.x, p.y);
    }
    if (kb.getKeyDown("z")) {
      this.exit({
        score: 2000,
      });
    }
  }
};

/* Main */
phina.main(() => {
  var app = new GameApp();
  app.enableStats();
  app.run();
});
```

## Develop

### clone

```
$git clone https://github.com/pentamania/phina.js.git
```

### Setup

`yarn install` or `npm install`

### Build: production

`yarn build` or `npm run build`

### Build and watch

`yarn dev` or `npm run dev`

## LICENSE

MIT
