.PHONY: install
install: .build/install

.PHONY: tests
tests: .build/tests

.PHONY: beautify
beautify: .build/beautify

.PHONY: lint
lint: .build/lint

.PHONY: coverage
coverage: coverage/lcov.info

.PHONY: report
report: coverage/lcov-report/index.html
	open $<

.PHONY: install-git-hook
install-git-hook:
	rm -f .git/hooks/pre-commit
	ln -s ../../git-precommit-hook.sh .git/hooks/pre-commit

.PHONY: clean
clean:
	rm -rf .build node_modules

.build/build: Makefile
	mkdir -p .build && touch $@

.build/install: .build/build package.json
	npm install && touch $@

TEST_PATH="tests"
TEST_FILES=$(shell test -d $(TEST_PATH) && find $(TEST_PATH) -type f -name "*.js")

SOURCE_PATH="src"
SOURCE_FILES=$(shell test -d $(SOURCE_PATH) && find $(SOURCE_PATH) -type f -name "*.js")

MOCHA=node_modules/.bin/_mocha

$(MOCHA): .build/install

.build/tests: .build/build $(MOCHA) $(TEST_FILES) $(SOURCE_FILES)
	test "$(TEST_FILES)" = "" || $(MOCHA) $(TEST_FILES)
	touch $@

JSBEAUTIFY=node_modules/.bin/js-beautify

$(JSBEAUTIFY): .build/install

.build/beautify: .build/build $(JSBEAUTIFY) $(TEST_FILES) $(SOURCE_FILES)
	$(eval FILES := $(filter-out .build/build $(JSBEAUTIFY), $?))
	test "$(FILES)" = "" || $(JSBEAUTIFY) -r $(FILES)
	touch $@

ESLINT=node_modules/.bin/eslint

$(ESLINT): .build/install

.build/lint: .build/build $(ESLINT) $(TEST_FILES) $(SOURCE_FILES)
	$(eval FILES := $(filter-out .build/build, $(filter-out $(ESLINT), $?)))
	test "$(FILES)" = "" || $(ESLINT) $(FILES)
	touch $@

ISTANBUL=node_modules/.bin/istanbul

$(ISTANBUL): .build/install

coverage/lcov.info: .build/build $(ISTANBUL) $(TEST_FILES) $(SOURCE_FILES)
	test "$(TEST_FILES)" = "" || $(ISTANBUL) cover $(MOCHA) $(TEST_FILES)

coverage/lcov-report/index.html: coverage
