PATH := $(PWD)/node_modules/.bin:$(PATH)
SOURCE := ./SassyIcons
SOURCEFILES := ./SassyIcons/stylesheets
BABELFLAGS := --playground

all: lint dist

esnext:
	babel $(BABELFLAGS) src/index.js -o dist/index.js
	babel $(BABELFLAGS) src/lib -d dist/lib

dist:
	trash --force dist
	mkdir -p dist
	cp -R src/assets dist/assets
	cp -R src/views dist/views
	cp src/defaults.json dist/defaults.json
	cp package.json dist/package.json
	make esnext
	gulp dist --type=publish

develop: dist
	trash --force ./sassdoc
	trash --force ./src/data.json
	# sassdoc $(SOURCEFILES) -vt ./dist -c ./dist/config.json
	# sassdoc $(SOURCEFILES) -vp > ./src/data.json
	gulp develop --type=develop


# Code quality
# ============

lint:
	eslint Gulpfile.js ./src/index.js ./src/lib ./src/assets/js/*.js


# Preview
# =======

preview: dist
	rm -rf .sassdoc
	sassdoc $(SOURCEFILES) -vt ./dist -d .sassdoc -c $(SOURCE)/config.json
	gulp deploy


# Release, publish
# ================

# "patch", "minor", "major", "prepatch",
# "preminor", "premajor", "prerelease"
VERS ?= "patch"
TAG  ?= "latest"

release: all
	npm version $(VERS) -m "Release %s"
	npm publish dist --tag $(TAG)
	git push --follow-tags


# Tools
# =====

rebuild:
	rm -rf node_modules
	npm install


.PHONY: dist develop
.SILENT: dist develop
