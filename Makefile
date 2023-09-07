export JEKYLL_VERSION=4.2.2

serve:
	@docker run --rm -p 4000:4000 -p 35729:35729 --volume="${PWD}:/srv/jekyll" jekyll/jekyll:${JEKYLL_VERSION} jekyll serve --livereload --config _config.yml,_config_algolia.yml

build:
	@docker run --rm --volume="${PWD}:/srv/jekyll" -it jekyll/jekyll:${JEKYLL_VERSION} jekyll build --config _config.yml,_config_algolia.yml

bash:
	@docker run --rm -p 4000:4000 --volume="${PWD}:/srv/jekyll" -it jekyll/jekyll:${JEKYLL_VERSION} bash
