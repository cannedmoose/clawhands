
.PHONY: serve
serve:
	python3 -m http.server

BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: release
release:
	git checkout master
	git merge $(BRANCH)
	git commit -a -m "release"
	git push