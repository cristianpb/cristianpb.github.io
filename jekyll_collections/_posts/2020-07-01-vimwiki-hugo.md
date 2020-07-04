---
layout: post
title: "Writing notes with Vimwiki and Hugo static generator"
date: 2020-07-01
description: Vim is a simple and ubiquitous text editor that I use daily. In this article I show how to use Vim to take and publish diary notes using Vimwiki and Hugo.
categories:
  - programming
tags: vim hugo jekyll github-actions
image:
  path: /assets/img/vimwiki-hugo/main-16x9.jpg
  height: 788
  width: 1400
thumb:
  path: /assets/img/vimwiki-hugo/main-thumb.jpg
  height: 225
  width: 400
ligthbox: true
video: true

---

Taking notes is important when you want to remember things. I used to have
notebooks, which worked fine, but it's complicated to search things when you
have a lot of things. As a die hard Vim user, I decided to give a try to
[Vimwiki](https://github.com/vimwiki/vimwiki) to help me organize my notes and ideas.

Vimwiki makes easy for you to create a personal wiki using the Vim text editor.
A wiki is a collection of text documents linked together and formatted with
plain text syntax that can be highlighted for readability using Vim's
syntax highlighting feature.

The plain text notes can be exported to HTML, which improves readability. In
addition, it's possible to connect external HTML converters like Jekyll or
Hugo.

In this post I will show the main functionalities of Vimwiki and how to
connect the Hugo fast markdown static generator.

<div class="columns is-mobile is-multiline is-horizontal-center">
<div class="column is-6-desktop is-12-mobile">
<amp-image-lightbox id="lightbox1"
  layout="nodisplay"></amp-image-lightbox>
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="vim1"
  alt="Markdown writing in vim"
  title="Markdown writing in vim"
  src="/assets/img/vimwiki-hugo/main.png"
  layout="responsive"
  width="737"
  height="697"></amp-img>
<div id="vim1">
  Vimwiki notes writing in Vim
</div>
</div>
<div class="column is-6-desktop is-12-mobile">
<amp-img on="tap:lightbox1"
  role="button"
  tabindex="0"
  aria-describedby="markdown1"
  alt="markdown html output"
  title="markdown html output"
  src="/assets/img/vimwiki-hugo/markdown.png"
  layout="responsive"
  width="650"
  height="633"></amp-img>
<div id="markdown1">
  Markdown notes converted into HTML
</div>
</div>
</div>

## Vimwiki ##

With Vimwiki you can:
* organize your notes and ideas in files that are linked together;
* manage todo lists;
* maintain a diary, writing notes for every day;
* write documentation in simple markdown files;
* export your documents to HTML.

### Vim shortcuts ###

One of the main Vim advantages is the fact that it's a modal editor,
which means that it has different edition modes. 
Each edition mode gives different functionalities to each key.
This increases the number of shortcuts without having to include multiple keyboard combinations. In Vimwiki this allows to write notes with ease.

When I want to write some notes, I just open Vim and then I use
`<Leader>w<Leader>w` to create a new note for today with a name based on the
current date. `<Leader>` is a key that can be configured in Vim, in my case it's *comma* character (,).

If I want to look at my notes I can use `<Leader>ww` to open the wiki index
file. I can use Enter key to follow links in the index. Backspace acts a return
to the previous page.

I use [CoC snippets](https://github.com/neoclide/coc-snippets) to improve autocompletion. In markdown, I find this plugin very useful to create tables, code blocks and links. You can use snippets for almost every programming language, just take a look at the documentation.

When I want to preview the markdown file, I use `<Leader>wh` to convert the current
wiki page to HTML and I added also a shortcut to open HTML with the browser.

In the following video you can see an example of this workflow in action.

<amp-video width="1024"
  height="610"
  src="/assets/img/vimwiki-hugo/video.mp4"
  poster="/assets/img/vimwiki-hugo/main.png"
  layout="responsive"
  controls
  loop
  autoplay>
  <div fallback>
    <p>Your browser doesn't support HTML5 video.</p>
  </div>
</amp-video>

### Searching in your notes ###

One of the advantages of digital notes are the fact that you can search quickly in multiple files using queries.

Vimwiki comes with a *VimWikiSearch* command (`VWS`) which is only a wrapper
for Unix *grep* command. This command can search for patterns in case insensitive mode in all your notes.

An excellent way to implement labels and contexts for cross-correlating
information is to assign tags to headlines. If you add tags to your Vimwiki
notes, you can also use a *VimwikiSearchTags* command.

In both cases, when you are searching in your notes, the results will populate
your local list, where you can move using Vim commands `lopen` to open the list, `lnext` to go to the next occurence and `lnext` for the previous occurence.

## Hugo ##

Vimwiki has a custom filetype called *wiki*, which is a little bit different
from markdown.  The native vimwiki2html command only works for *wiki*
filetypes. If you want to transform your files to HTML using other filetypes, like markdown, you have to use a custom parser. Even if I'm not able to use Vimwiki native parser, I prefer markdown format because it's very popular and simple.

These are some options to use as an external markdown parser:
* *Pandoc*, which I think works pretty good, but requires a lot of haskell dependencies. 
* [Python vimwiki markdown](https://github.com/WnP/vimwiki_markdown/) libraries, which I think has a lot of potential.
* Static website generators like Jekyll, Hugo or Hexo.

I started using static website generators because it can also publish easily the notes as static webpages, which I wanted to publish in Github Pages.

My first option was Jekyll, which is the Github native supported static website generator. It's easy to use and the syntax is very straightforward, but I started to regret it when I accumulated a lot of notes. Then I decided to use Hugo, which is claimed to be faster and since it's been coded in Go, it has no dependencies. In the following table I show my compiling time results for both:

| Compiling time | Jekyll        | Hugo        |
| -------------  | ------------- | -------     |
| 10 pages       | 0.1 seconds   | 0.1 seconds |
| 150 pages      | 48 seconds    | 0.5 seconds |

I should say that I used Jekyll Github gems, which includes some unnecessary
ruby Gems, so I think Jekyll performance can be increased. It's a nice software that I use to publish this post, but still Hugo is faster.

### Building Vimiki with Hugo ###

The `.vimrc` file  contains vim configuration and it's the place where one can
put the definition about Vimwiki syntax and writing directory.  As
you can see in my configuration, I use markdown syntax and save my files under
`~/Documents/vimwiki/`.

```vim
" ~/.vimrc

let g:vimwiki_list = [{
  \ 'auto_export': 1,
  \ 'automatic_nested_syntaxes':1,
  \ 'path_html': '$HOME/Documents/vimwiki/_site',
  \ 'path': '$HOME/Documents/vimwiki/content',
  \ 'template_path': '$HOME/Documents/vimwiki/templates/',
  \ 'syntax': 'markdown',
  \ 'ext':'.md',
  \ 'template_default':'markdown',
  \ 'custom_wiki2html': '$HOME/.dotfiles/wiki2html.sh',
  \ 'template_ext':'.html'
\}]
```

The custom wiki2html file correspond to a script which is executed to transform
markdown into HTML. This scripts calls Hugo executable file and tells Hugo to
use the Vimwiki file path as a baseurl in order to maintain link dependencies.

```bash
# ~/.dotfiles/wiki2html.sh

env HUGO_baseURL="file:///home/${USER}/Documents/vimwiki/_site/" \
    hugo --themesDir ~/Documents/ -t vimwiki \
    --config ~/Documents/vimwiki/config.toml \
    --contentDir ~/Documents/vimwiki/content \
    -d ~/Documents/vimwiki/_site --quiet > /dev/null
```

The complete version of my `~/.vimrc` can be found in [my dotfiles repository](https://github.com/cristianpb/dotfiles).

### Deploy Vimwiki to Github Pages ###

Hugo projects can be easily published to Github using Github Actions. The
following script tells GitHub worker to use Hugo to build html at each push
and publish the HTML files to Github pages.

```yaml
name: 🚀 Publish Github Pages

on: push
jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Git checkout
        uses: actions/checkout@v2

      - name: Setup hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'

      - name: Build
        run: hugo --config config-gh.toml

      - name: 🚀 Deploy to GitHub pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          {% raw %}deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}{% endraw %}
          publish_branch: gh-pages
          publish_dir: ./public
          force_orphan: true
```

I like having one part of my notes published on Github Pages, at least the
configuration notes, which can be found in [my Github
page](https://cristianpb.github.io/vimwiki). But there is also a part of notes
that I keep private, for example my diary notes, where I may have some sensible
information, so I keep it away from publication just by adding it to the
`.gitignore` file. Here you can find [my Github notes
repository](https://github.com/cristianpb/vimwiki).

## Conclusion ##

I like that fact that Hugo has no dependencies since it's written in Go, so
it's very easy to install, just download it from the github project releases
page. In addition is also a blazing fast static website converter, you can find
benchmarks in the internet.

I have been using Vimwiki very often, it allows me to take notes very easily
and also find information about things that happen in the past. When people ask
things about last month meeting I can find what I have written easily by
searching by dates, tags or just words.

Publishing my notes to github allows me to have a have a place where I can keep
track of my vimwiki configuration and also publish simple notes that are not
meant to be a blog post, like my install for arch linux or my text editor
configuration.
