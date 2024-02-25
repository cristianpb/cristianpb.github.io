export JEKYLL_VERSION=4.2.2

serve:
	@docker run --rm -p 4000:4000 -p 35729:35729 --volume="${PWD}:/srv/jekyll" jekyll/jekyll:${JEKYLL_VERSION} jekyll serve --livereload --config _config.yml,_config_algolia.yml

build:
	@docker run --rm --volume="${PWD}:/srv/jekyll" -it jekyll/jekyll:${JEKYLL_VERSION} jekyll build --config _config.yml,_config_algolia.yml

bash:
	@docker run --rm -p 4000:4000 --volume="${PWD}:/srv/jekyll" -it jekyll/jekyll:${JEKYLL_VERSION} bash

html-test:
	@docker run --rm -p 4000:4000 --volume="${PWD}:/srv/jekyll" -it jekyll/jekyll:${JEKYLL_VERSION} /bin/bash -c 'gem install html-proofer && /usr/gem/bin/htmlproofer --ignore-urls "/www.linkedin.com/,/twitter.com/,/www.researchgate.net/,/www.sciencedirect.com/,/www.arduino.cc/,/www.velib-metropole.fr/,/herokuapp.com/,/www.tandfonline.com/" --ignore-missing-alt --allow-missing-href --ignore-status-codes "0"  /srv/jekyll/_site'
