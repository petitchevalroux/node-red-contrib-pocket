.PHONY: install
install: .build/install

.PHONY: tests
tests: .build/tests

.PHONY: beautify
beautify: .build/beautify

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

JSBEAUTIFY=node_modules/.bin/js-beautify

$(JSBEAUTIFY): .build/install

.build/beautify: .build/build $(JSBEAUTIFY) $(TEST_FILES) $(SOURCE_FILES)
	$(eval FILES := $(filter-out .build/build $(JSBEAUTIFY), $?))
	test "$(FILES)" = "" || $(JSBEAUTIFY) -r $(FILES)
	touch $@
