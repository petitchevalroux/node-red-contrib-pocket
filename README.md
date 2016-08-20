# node-project
Empty node project using continuous integration tools to ensure code quality.
## Creating new project
```
export PROJECT_DIRECTORY="<project directory>"; \
export GIT_REPOSITORY="git@github.com:<github user>/<github repository>.git"; \
git clone git@github.com:petitchevalroux/node-project.git $PROJECT_DIRECTORY; \
cd $PROJECT_DIRECTORY; \
git remote remove origin; \
git remote add origin $GIT_REPOSITORY; \
git remote add node-project git@github.com:petitchevalroux/node-project.git; \
make install-git-hook;
```

/!\ DO NOT FORGET TO UPGRADE YOUR package.json/!\

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
[eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise)
```
make lint
```

### Generate code's coverage files
Coverage files are generated using istanbul [istanbul](https://github.com/gotwarlost/istanbul).
They are located in coverage/ directory. You can find lcov.info in coverage/lcov.info.
```
make coverage
```

### Open corerage html report
Html coverage report is located in coverage/lcov-report/index.html.
The following command open it in your default browser. Launching this command
without having tests will fail.
```
make report
```

### Install git precommit-hook
The pre-commit hook is located in git-precommit-hook.sh. The following command
enable it by creating a symlink from .git/hooks/pre-commit to git-precommit-hook.sh.
```
make install-git-hook
```

### Clean all build and installed files
```
make clean
```
### Check code coverage
Code coverage is checked using [istanbul](https://github.com/gotwarlost/istanbul).
Minimum coverage threshold are 80% by default and can be configured in .istanbul.yml file.
```
make check-coverage
```
