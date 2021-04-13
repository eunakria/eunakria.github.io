---
layout: post
title:  "The inaccessible terminal"
date:   2021-04-11
proof:  true
---

Accessibility (hereafter refered to as a11y) comes in many forms. It refers to accommodation for people with physical disablities, people who struggle with understanding complex models, or even simply fully able people in environments or constraints that prevent them from using applications to their full capability.

It's a well-known fact at this point that the traditional UNIX-like terminal model (hereafter the shell) is notorious for committing a lot of sins on this aspect, and modern UI/UX designers generally see the shell as a keep example of what *not* to do. To quote *The Unix Hater's Handbook,* a humorous take on the bad design of UNIX from the early Macintosh era:

> Ken Thompson has an automobile which he helped design. Unlike most automobiles, it has neither speedometer, nor gas gauge, nor any of the other numerous idiot lights which plague the modern driver. Rather, if the driver makes a mistake, a giant “?” lights up in the center of the dashboard. “The experienced driver,” says Thompson, “will usually know what’s wrong.”

UNIX was a product of its time. It was a set of building blocks, scripting tools that all tried their absolute best to stay out of the end user's way, in part because that gave the user more freedom to do what they want, and in part because a program that did too much was too *slow* to use.

The irony is that a lot of things that are today done the "UNIX way" &ndash; chains of `sed` scripts and imperative configuration files galore &ndash; are the slowest and clunkiest parts of modern computers. Linux computers that use shell script-based inits boot slower than those that use inits with their own daemon management. Terminal windows become slower to start wiith every program you install that has to load itself into the `$PATH`.

One thing remains, and that is the power of the shell. Well, not "the" shell itself, as it existed way back in the day, and modern users of the shell are eager to point that out. Modern users don't use the original Bourne shell; they may instead use `bash` or `zsh` or `fish`. They will set a flag for `ls` that allows it to use colors. They will use `perl -pe` whenever their complicated regex doesn't work with plain `sed -E`.

It's a testament to how insufficient these programs were, but maybe the fundamental principles still live? My take is that they didn't.

<div id="table-of-contents"></div>

## Discoverability

The shell scares off new users, and most experienced folk write it off as being unwilling to step out of one's comfort zone. *"If only you had been willing to get used to something slightly different,"* they often ration, *"you could unlock such hidden potential!"* I believe this is nothing more than survivorship bias.

A common driving principle in modern software development is that the user should be confronted with the software's features, laid out cleanly in hierarchy, guiding the user to where they have to go rather than making the user search though manuals (paper, electronic or online) to find what they want to do. A common display of this is in the design pattern of the ribbon, pioneered by Microsoft in their Office 2007 suite.

When working with Office, looking for a given tool, the mind naturally gravitates to the tabs at the top of the ribbon first. *"What does the thing I want to do, have to do with? I want to change the page size, so it's probably in Layout."* So, you go there. Then, you scan the list of icons to see which one seems like it has to do with page size. You check the text caption under the ones that seem relevant, and then you know you've found the right button.

Modern versions of Office, and, in fact, modern versions of any program with especially good UX, have a search bar as well, so if you can't figure out where something is but know it by name, you can search for it by that name.

Now, let's see how the shell handles this:

<pre><code><span class="green">euna@Anchor</span>:<span class="blue">~</span>$ <u class="blink"> </u></code></pre>

(The joke is that there's nothing here.)

The shell essentially gives you nothing to start off with. A lot of traditional UNIX programs are that way, and again, this is a product of its time. Back in the day, I/O was expensive &ndash; folks had teletypewriters as their chief method of interface with their computers, and they were mighty slow. This even extended to the text editor.

Oh, god, the text editor. `ed` is such a hilariously unintuitive program that even the shell die-hards will leap at a chance to bash it. The only error message it gives is a single `?`. It doesn't have any help section from within the program; it doesn't even tell you how to quit out of it.

When you understand what's going on, it's a lot like the `vi` command line without the actual visual display; in fact, the `vi` command line was modeled after `ed`. But, `ed` is the chiefest example of a shell program throwing you into the deep end.

### Designing for discoverability

If the issue is that the shell isn't discoverable, how do we make it discoverable? Surely something about the text-based interface the shell is intertwined with makes it impossible to "discover". I don't believe that's the case, but a lot of my opinions would mandate a fundamental overhaul of the shell. I recognize that it's too late at this point. POSIX is a codified and ubiquitous standard, the shell is used in places you would never expect it and it's something of a rite of passage for sysadmins worldwide. Nonetheless, it's fun to philosophize.

The first complaint of mine is strange command names. A lot of commands are given short names so that they're easy to type, but the consequence of this is that they're unclear.

* `ls`, the command to list the contents of a directory, stands for the first two consonants in **l**i**s**t.

* `rm`, the command to **r**e**m**ove a file, follows the same scheme of abbreviation.

Some others are named after strange, complicated, or obscured names.

* `awk` is a domain-specific language for text transformation in shell script, and it's named after its creators, Alfred **A**ho, Peter **W**einberg and Brian **K**erninghan.

* `grep` stands for a mnemonic in `ed`, `g/re/p`, or **g**et a **r**egular **e**xpression and **p**rint. Once you know that, you can tell it's a tool to filter incoming text by regex.

* `dd` stands for **c**arbon **c**opy, but since `cc` is already taken for **C c**ompiler and `cd` is already **c**hange **d**irectory, they had to improvise.

The UNIX shell can be compared, to an extent, to Microsoft's modern, data structure driven, .NET powered alternative called PowerShell. Many first-time users of PowerShell mock it for its verbose `Verb-Noun` commands, with such ridiculous names as `Get-ChildItem` to list the contents of a directory. It has saner, shorter aliases such as `ls` for these unwieldy commands, though they sometimes conflict with brand names, as is the case with `wget`.

There's something nice that happens when you try to search for a command in PowerShell, because it's always named after what it does, in long form, so you can search for the command you want quite efficiently. If I want to find something that can tell me the hash of a file, I can start with `*hash` (note the wildcard) and press tab to autocomplete a few times. Then, I stumble upon `Get-FileHash`, which seems to do what I want.

This doesn't work universally, and it's a little strange that PowerShell puts what you want to do *with* the object you're working with before what the object type *is.* However, naming every command after what it does is a huge step forwards.

If I were to revise this further, I would envision an interface something like this:

<pre><code><span class="red">$</span> <span class="yellow">whatis</span> cd
<b>cd</b> is an alias for <b>directory-change</b>.

<span class="red">$</span> <span class="yellow">help</span> cd
<b>directory-change [directory]</b>
  Changes the current directory and pushes it to the history.
  To return to the previous directory, use <b>directory-return</b>.
<b>Aliases:</b>
  cd

<span class="red">$</span> <span class="yellow">help</span> directory-return
<b>directory-return</b>
  Reads off the directory history and goes back the previous path.
<b>Aliases:</b>
  popd

<span class="red">$</span> <span class="yellow">cd</span> Desktop/

<span class="red">$</span> <u class="blink"> </u></code></pre>

In my opinion, the shell should be highly willing to explain parts of itself to the user, rather than confront them with everything at once. This is what I fail to see, and what I'm campaigning ought to be implemented here.

There are many other changes I would make &ndash; for example, I would make it possible to explore modules as a whole, that have to do with things like file management, system settings, disk and partition management, etc.; but the fundamental point is that it should be possible to find commands and explore the system.

## Footguns

Footguns are a playful name for the metaphor of "shooting yourself in the foot". They're a term to refer to the unknown unknowns of learning a new program, the things that a new user really should watch out for, but won't be told about in advance. Oh, what a shame it would be if they accidentally delete or overwrite a super important file!

The shell is full of its little footguns, and this becomes more obvious once you start to use its capability to chain commands together in pipelines, or even write whole loops and structures to process data in bulk. Let's go over a few, as a nice little lightning round:

1. The `$( )` operator, used to pass one command's output as an argument to another, by default "expands", which means it turns outputs with spaces into multiple arguments. This means that if you wrote something like this:

	```sh
	# Prints the string 'Hello, world!'
	a () {
		echo 'Hello, world!'
	}

	# Prints each argument on a separate line.
	b () {
		idx=1
		for el in "$@"; do
			echo "$idx: $el"
			idx=$(( idx + 1 ))
		done
	}

	# Spot the bug :)
	b $(a)
	```

	You would not get the expected output,
	```
	1: Hello, world!
	```

	But instead, this:
	```
	1: Hello,
	2: world!
	```

1. The same thing goes for variables. This

	```sh
	hello='Hello, world!'
	b $hello
	```

	Also confusingly prints:
	```
	1: Hello,
	2: world!
	```

1. Shell script keeps going when you hit an error! You have to explicitly disable this behavior with `set -e`, which causes any non-zero exit code to cause the program to terminate immediately.

	```sh
	# Supposed to print 'Hello, '
	a () {
		echo -n 'Hello, '
	}

	# Supposed to cause an error
	b () {
		return 1
	}

	# Supposed to print 'world!'
	c () {
		echo 'world!'
	}

	a; b; c
	```

	Now, instead of the expected output `Hello, ` followed by an error, we get the full string:
	```
	Hello, world!
	```

1. Speaking of which, conditionals are commands, and they're supposed to fail to indicate the condition is false. The thing is, they can also fail if the command encounters any other error. There is no simple way to guard against this.

	The following is wrong:
	```sh
	if grep -i 'hello' "$file"; then
		echo "$file contains hello"
	else
		echo "$file does not contain hello"
	fi
	```

	And the following is right:
	```sh
	grep -i 'hello' "$file"
	success=$?
	if [[ $success -eq 0 ]]; then
		echo "$file contains hello"
	else if [[ $success -eq 1 ]]; then
		echo "$file does not contain hello"
	else
		# Handle error
	fi
	```

The answer here must be made plain and harsh. The shell should not have any of these complexities. It's intimidating, confusing, infuriating and leads to bug-filled code and frustration. The shell is also the scripting language for whenever a developer needs to tie together other applications. If it's so load-bearing, why does it have these irritating flaws?

The shell may be powerful, but that power is thwarted by the user having to remember all these little nuances to find their way around it. It isn't nearly as automatic as it hopes to be, and all its little flaws truly hold it back.

## Assistive tech

Oh, boy, this is the big one! The terminal is famously at odds with assistive technology. Technologies to mimic a graphical interface in the terminal are incredibly common, even permeating into the modern day under the laudatory remarks of how lightweight and yet powerful they are. However, many people fail to see the ultimate utter lack of polish these technologies have. The easiest way to do that is to simply show how well these programs cooperate with one of the most common assistive technologies, the humble screen reader.

Testing with a screen reader is an imperative part of my work as a web designer. If my app doesn't work with a screen reader, it's not good enough. That means that anyone who's blind, vision-impaired, motor-impaired, and many people who suffer from other conditions, *cannot* use my app.

Usually, I rock a fairly customized setup, complete with `zsh` with syntax highlighting, a heavily customized Neovim, etc.. but right now, we're going back to the basics. I'm using a fairly default Ubuntu setup right now. Plain `bash`, fairly uncustomized `vim`, unmodified `man` paged with `less`. Pay attention to what you hear. Notice how the screen reader can never tell what to read to you.

[TBD]

This is the most unfortunate reality of the shell. It's fundamentally exclusionary, even ableist. A11y was never a huge concern back in the UNIX days, but now, the shell simply doesn't cut it for folks who need a helping hand. It's frustrating to work with if you can't *see* the terminal &ndash; which is a little ironic, because one of the things the shell is most lauded for is not having a graphical interface, only text.

This is also what upsets me the most about anything in the shell. Never mind the fact that it's hard to jump into, never mind having to remind yourself of all the little quirks it's accumulated over a history of poor decisions. The biggest poor decision of the shell is inescapable, and that is the lack of consideration of users of assistive tech.

It's impossible at this point to retrofit the terminal with some sort of compatibility layer for assistive tech. Modern UIs think in terms of hierarchy; you have boxes inside boxes, text inside panels inside views. Terminal UI is flat, even hacky; you have to lay out everything yourself. Modern terminal text editors have fair amounts of code to calculate the width of text, because monospace isn't truly monospace &ndash; find out how much space that escape sequence will take, or that composed emoji, or even distinguish between Latin (single-width) and CJK (double-width) characters.

This is all already written code. UI frameworks have figured out text layout for developers years ago. Terminal programs have to rewrite all of that, and each program has its own bespoke layout system, utterly innavegable labrynths of abstractions. Assistive technology cannot dream to understand it all, especially when all it's exposed to is the control codes that tell the cursor to move back and forth to print data.

## Conclusion

Phew, that was a long one! So, how can things truly be improved?

For one, I would suggest to adopt the model of the notebook. The notebook and shell are fundamentally similar in a lot of ways &ndash; you enter code, then it gives you a reply. Rinse, repeat, ad nauseum. However, the notebook takes full advantage of graphical interfaces. Initially, this was designed to give mathematical programming languages like Wolfram and Julia an edge, being able to display complex graphs and mathematical notation seamlessly.

However, I believe that the same principles could be adapted to the terminal. Obviously, it wouldn't operate the same as the notebook &ndash; the terminal should still prioritize being able to enter code quickly rather than create a readable document out of a shell session. Similarly, pipeline programming and live output are still hugely useful tools and intuitive mental models, and programs should be able to instate their own prompts, etc.; rather than notebook functions, which only have a single return value like in most programming languages.

Atop that, I believe that graphical layout programs should be exported into separate windows. Applications should open graphical windows if they need it, rather than trying to cram everything into a single, convoluted interface.
