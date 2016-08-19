.PHONY: install
install: .build/install

.PHONY: tests
tests: .build/tests

.build/build: Makefile
	mkdir -p .build && touch $@

.build/install: .build/build package.json
	npm install && touch $@

MOCHA=node_modules/.bin/_mocha

TEST_PATH="tests"
TEST_FILES=$(shell test -d $(TEST_PATH) && find $(TEST_PATH) -type f -name "*.js")

SOURCE_PATH="src"
SOURCE_FILES=$(shell test -d $(SOURCE_PATH) && find $(SOURCE_PATH) -type f -name "*.js")

$(MOCHA): .build/install

.build/tests: .build/build $(MOCHA) $(TEST_FILES) $(SOURCE_FILES)
	test "$(TEST_FILES)" = "" || $(MOCHA) $(TEST_FILES)
	touch $@
