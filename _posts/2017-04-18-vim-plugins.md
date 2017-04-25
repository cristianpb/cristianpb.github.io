---
layout: post
title:  "Vim plugins"
date:   2017-04-18 21:01:25 +0200
categories: vim 
description: "My vim workflow. Description of some plugins and functionlities."
---

# Vim 

I really like [vim](https://github.com/vim/vim). I think it is [good for my fingers](http://stackoverflow.com/questions/29500098/is-there-any-data-supporting-a-correlation-between-carpal-tunnels-and-using-keyb) because it uses few short cuts. Instead of using combos with touches like _Ctrl_, _Alt_ or _MetaKey_, it uses different function modes (normal, insert, visual and command). In this way, the fingers remain  near the [home row](https://en.wikipedia.org/wiki/Touch_typing) in rest position, being able to have a continuous typing rate. [Some people](http://stackoverflow.com/questions/29500098/is-there-any-data-supporting-a-correlation-between-carpal-tunnels-and-using-keyb) speculate that this can prevent [musculoskeletal diseases](https://en.wikipedia.org/wiki/Repetitive_strain_injury). 

It also induce motion to be done without neither the [arrow keys](https://en.wikipedia.org/wiki/Arrow_keys) nor the mouse. Instead single movement is controlled by _HJKL_ keys to avoid the movement of the hand for every manipulations of the text. In addition vim offers [several other motions](http://vimdoc.sourceforge.net/htmldoc/motion.html#operator) capabilities, by word, by line, by paragraph, by places of text, etc.

It is simple and it is ubiquitous in most Unix operating systems. Still it is very powerful and can be highly customized with plugings.
I will present my vim workflow in the following sections.

## Plugin manager

I use [vundle](https://github.com/VundleVim/Vundle.vim) as a plugin manager. I
can configure your plugins right in the .vimrc. I can
install/update/search/remove/clean plugins.

> one plugin to rule them all.

All that with a single keypress with an interactive mode. In addition it regenerates the tags automatically after installing and updating, as a difference from pathogen for example.

## Navigation

I use [nerd tree](https://github.com/scrooloose/nerdtree) to explore my file system and open files from inside vim. It performs simple filesystem operations, saving bookmarks, etc. I like to have `F3` as a shortcut for this plugin and also to ignore python `*.pyc` files.

```vim
" NerdTreeToogle
let NERDTreeIgnore=['\.pyc$', '\~$'] "ignore files in NERDTree
nmap <silent> <F3> :NERDTreeToggle<CR>
```

![](https://cdn-images-1.medium.com/max/800/1*yFuOEvHxG9U0AUjrDlpbrQ.png)

I use [tagbar](https://github.com/majutsushi/tagbar) to browser tags of the current file and its structure. 
It does this by creating a sidebar that displays the ctags-generated tags of
the current file, ordered by their scope. This means that for example methods
in python are displayed under the class they are defined in. I like to toggle this plugin using `F6` shortcut.

```vim
" Tagbar
nmap <F6> :TagbarToggle<CR>
```

![](https://camo.githubusercontent.com/fc85311154723793776aed28488befdfaab36c42/68747470733a2f2f692e696d6775722e636f6d2f5366394c7332722e706e67)

## Customization 

I use the combo [airline](https://github.com/bling/vim-airline), [tmuxline](https://github.com/edkolev/tmuxline.vim) and [promptline](https://github.com/edkolev/promptline.vim) to put the same theme on the vim status bar, my tmux bar and my promptline.
They are highly configurable and can control some other themes.
In the vim status bar, I have information about the git branch, the type of file, the number of words, the place of the file, etc.
In my tmux bar I have included the number of new emails, the number of slack new notifications and I can also include some information like the weather.
In my promptline I have information about the git branch, the python virtual environment and whether if the last command have a error code.

```vim
" Airline
let g:airline#extensions#whitespace#enabled = 0
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#branch#enabled=1
let g:airline#extensions#hunks#enabled=0
let g:airline_powerline_fonts = 1

" Tmuxline
let g:airline#extensions#tmuxline#enabled = 1
let g:airline_theme='solarized'
let g:tmuxline_preset = {
      \'a'    : '#S',
      \'b'    : '#(~/Documents/Script/new_mail.sh)',
      \'win'  : ['#W'],
      \'cwin' : '#F #W',
      \'y'    : '#(~/Documents/Script/tmux-slack-notifier.sh)',
      \'z'    : '%R'}

" Promptline
"":PromptlineSnapshot! .shell_prompt.sh airline
let g:promptline_preset = {
        \'a'    : [ promptline#slices#host() ],
        \'b'    : [ promptline#slices#cwd() ],
        \'c'    : [ promptline#slices#vcs_branch() ],
        \'warn' : [ promptline#slices#last_exit_code() ],
        \'z'    : [ promptline#slices#python_virtualenv() ]}
```



![](https://github.com/vim-airline/vim-airline/wiki/screenshots/demo.gif)

## Git tools

I use [fugitive](https://github.com/tpope/vim-fugitive) to use git inside vim, it is consider one of the best git wrapers of all time. It allows to see the changes of each file from different version, the file logs, the changes using `git blame` and from my personal point of view, the merge conflict resolution are easy to solve using fugitive. I have the default options of the pluging. The only thing that I have change is that I prefer to have a vertical split when dealing with merge conflicts.

```vim
" Fugitive
set diffopt+=vertical "Vertical split by default
```

![](https://camo.githubusercontent.com/dae2bbd335e42f9d093c46e4631e8af6fb3fdeed/687474703a2f2f692e696d6775722e636f6d2f4b526176612e706e67)

I also use [vim-gitgutter](https://github.com/airblade/vim-gitgutter) to check the lines that has been modified, removed or added with a simple plus and minus sign at the left part of the file. It have disable this pluing by default, and configure a shortcut using `,d`

```vim
" Git gutter (Git diff)
let g:gitgutter_enabled=0
nnoremap <silent> <leader>d :GitGutterToggle<cr>
```

![](https://raw.github.com/airblade/vim-gitgutter/master/screenshot.png)

## Syntax checking

I use [Syntastic](https://github.com/scrooloose/syntastic) the syntax checker. It supports all the programming languages that I know. For python it has support of flake8, pyflakes and [pep8](https://www.python.org/dev/peps/pep-0008/) in general. I have this plugin in passive mode so that it doesn't bother me when I am coding. I use the shortcut `,sc` to activate it. It is also possible to customize the visual appareance.

```vim
" Syntastic
nnoremap <leader>sc :SyntasticToggleMode<CR>
let g:syntastic_mode_map                 = { 'mode': 'passive', 'active_filetypes': [],'passive_filetypes': [] }
let g:syntastic_always_populate_loc_list = 0
let g:syntastic_enable_highlighting      = 1 " Highlight
let g:syntastic_auto_loc_list            = 1 " No erros list
let g:syntastic_enable_signs             = 1 " No sign column
let g:syntastic_check_on_open            = 1
let g:syntastic_check_on_wq              = 0
```

![](https://github.com/vim-syntastic/syntastic/raw/master/_assets/screenshot_1.png)

## Writting tools

I use [easy aligns](https://github.com/junegunn/vim-easy-align) plugin to create text tables, align equations and assignments. I select the text that I want to align, then I use the shortcut `<Enter>` to activate the pulgin and then I write the character where I want to align.

```vim
" Easy Align
"" Start interactive EasyAlign in visual mode (e.g. vip<Enter>)
vmap <Enter> <Plug>(EasyAlign)
"" Start interactive EasyAlign for a motion/text object (e.g. gaip)
nmap ga <Plug>(EasyAlign)
```

![](https://raw.githubusercontent.com/junegunn/i/master/easy-align/equals.gif)

I use [surround](https://github.com/tpope/vim-surround) to modify any time of parentheses.

![](https://two-wrongs.com/static/image/surround_vim.gif)

I use [ultisnips](https://github.com/sirver/ultisnips) to use predefined snippets. There are several snippets for each programming language. It is also possible to create very modular snippets. I have added a path where I put my own snippets inside `~/.vim/`.

```vim
" UltiSnips
let g:UltiSnipsEditSplit="vertical" " If you want :UltiSnipsEdit to split your window.
" Trigger configuration. Do not use <tab> if you use https://github.com/Valloric/YouCompleteMe.
let g:UltiSnipsExpandTrigger="<tab>"
"let g:UltiSnipsJumpForwardTrigger="<c-b>"
"let g:UltiSnipsJumpBackwardTrigger="<c-z>"
set runtimepath+=~/.vim/my-snippets/
```


![](https://raw.github.com/SirVer/ultisnips/master/doc/demo.gif)


# My complete list of plugins

<script src="https://gist.github.com/cristianpb/504f9d105edabf4a0a04ff18bbbc6df0.js"></script>
