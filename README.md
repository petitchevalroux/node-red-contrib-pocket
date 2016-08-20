# node-project
Empty node project

## Make commands
### Install
Install dependencies
```
make install
```

### Run tests
Run tests. Tests are located in tests/ directory and run using [mocha](https://github.com/mochajs/mocha).
```
make tests
```

### Run beautifier
Beautify javascript files using [js-beautify](https://github.com/beautify-web/js-beautify).
```
make beautify
```

### Run linter
Run linter on javascript files using [eslint](https://github.com/eslint/eslint).
Native promises are forbidden. Promise's good practice are checked using
(eslint-plugin-promise)[https://github.com/xjamundx/eslint-plugin-promise]
```
make lint
```
