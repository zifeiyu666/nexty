# I couldn't find a Valentine's Day gift that felt personal, so I built one

*How a frustrating search for one meaningful gift became One Custom Song*

Valentine's Day was getting close, and I had reached the familiar stage of gift shopping where every open tab looked like a variation of the one before it.

There was perfume, jewelry, flowers, and an alarming number of stuffed animals holding hearts. I went through the usual shopping platforms and wandered into a few physical stores. Most of what I found was perfectly nice. That was the problem.

Those gifts could say, "I remembered Valentine's Day." I wanted something that said, "I remember us."

I kept thinking about the small details that belong to a relationship: the restaurant we still talk about from our first trip, the melody she hums when it rains, the jokes that would make no sense to anyone else. None of them fit neatly into a product listing. They were too ordinary for a grand romantic gesture and too specific for something pulled from a shelf.

Then I thought about giving her a song.

## A custom song sounded right, until I tried to make one

My first Google search was some version of "how to make a song yourself." It did not take long to discover how many skills I did not have. Writing lyrics was only the beginning. There was composition, arrangement, vocals, mixing, and all the judgment that comes from knowing when a song is working.

I looked at services such as Songfinch, where independent musicians create songs from a customer's story. I liked the idea, and I understood why it cost what it did. A real musician was doing real work. Still, the price and production time made the decision difficult for me.

The larger issue was the distance between request and result. You send your story to someone, wait for them to interpret it, and hope their interpretation feels like yours. Any revision adds another round of messages and another stretch of waiting. For a gift built around private memories, that uncertainty feels surprisingly heavy.

I was not looking for a cheaper imitation of a commissioned musician. I wanted a different kind of creative process, one where I could stay involved. I wanted to change a memory, hear what happened, rewrite two lines, and try another musical direction while the thought was still fresh.

AI made that possible. Yet the AI music products I found were mostly general purpose generators. They were good at turning a prompt into a track. They rarely treated the track as a gift, and they did not help with everything that comes after the audio: the lyrics, the presentation, the moment of giving it to someone.

So I started building [One Custom Song](https://onecustomsong.com).

## Start with the story, not a clever prompt

![Screenshot placeholder: the song creation flow, including story input, music style, and generation progress.](REPLACE_WITH_SONG_CREATION_SCREENSHOT_URL)

The first song I made was about our first trip together, the coffee she always orders, and a few habits no one else would recognize. My initial description was bad. It read like a form because, technically, I was filling in a form.

The song changed when I stopped trying to sound romantic and began writing down what had happened.

That experience changed the product I was building. A custom song should begin with a story, regardless of whether the user knows how to write the perfect prompt. You can describe the person, the occasion, a memory, or something you have never quite managed to say aloud. The interface helps turn that material into lyrics and a musical direction without asking you to pretend you are a songwriter.

I could add a sentence such as, "She has a habit of leaving her phone in taxis," and see how the lyrics absorbed it. If the result felt too literal, I could soften the line. If it became too sentimental, I could pull it back. The AI handled structure, rhyme, and singability. My job was to recognize what felt true.

AI can handle the musical scaffolding. The person making the gift still decides what the song means and which details belong in it.

## Making AI lyrics sound less like AI

![Screenshot placeholder: the story editor and lyric editor, showing the original story, an AI draft, and line-level revisions.](REPLACE_WITH_STORY_AND_LYRICS_EDITOR_SCREENSHOT_URL)

Turning a personal story into lyrics takes more than adding line breaks and finding words that rhyme. Early versions had a habit familiar to anyone who has spent time with generated writing. They reached for large, polished emotions while stepping over the small facts that made the story worth telling.

We added a humanizing pass to both story and lyric generation. I use the word "humanizing" carefully because it can sound like a magic filter. It is closer to an editorial routine.

The system first protects the details that carry identity: names, places, odd habits, private references, and the sequence of what happened. It looks for generic declarations such as "you are my everything" when the user's own story contains something more convincing. It also checks whether adjacent lines are repeating the same emotion in different words. Finally, it reshapes prose into language that can be sung without sanding away every irregular edge.

The result still needs the person who lived the story. No model can know that a harmless sentence will land badly, or that an unremarkable phrase has ten years of history behind it. I do not see that as a failure of the product. It is exactly why the editor exists.

More context helps, though. When you write about several memories instead of one, the AI has more evidence for your vocabulary, your sense of humor, and the way you describe the other person. It is not learning your soul. It is simply working with better material.

Specificity does most of the emotional work. "You are the best person in the world" could be written about anyone. "You order my coffee before I remember I am tired" belongs to someone.

## The editor matters as much as generation

I did not want the lyric generator to produce a single polished answer and ask the user to approve it. Creative work rarely happens that way, even when the first draft is good.

In the lyric editor, you can generate another complete version with a note about what you want changed. You can also select a few lines and rewrite only those lines. If the chorus is right but the second verse sounds too formal, there is no reason to disturb the chorus. And if you already know the exact words you want, you can type them yourself. There is no locked structure that forces the AI's choices to survive.

This is the role I find most useful for AI: a copilot with no ego about revisions. It offers options quickly, but it does not get the final say.

## Hearing the story become a song

![Screenshot placeholder: the final lyrics and song generation screen, including preview progress and version selection.](REPLACE_WITH_LYRICS_RESULT_SCREENSHOT_URL)

Once the lyrics felt right, I reached the part I had been waiting for. Details that had existed in old messages and half-remembered conversations came back with melody, tempo, and a voice.

There is a strange tension in those first few seconds of playback. You listen for musical quality, of course, but you are also listening for recognition. Does this sound like the person I had in mind? Did the most important line survive? Is the chorus sincere, or did it drift into greeting-card language?

One Custom Song uses current AI music models within a generation workflow tuned for personal music gifts. For this use case, the system has to respect a fixed story, support revised lyrics, and create a song that can hold someone's attention as a gift rather than function as disposable background audio.

While the song is generating, you can write a card and create a cover image with AI. You can upload your own image instead, which is often the better choice when a particular photograph already carries the memory.

If the first version misses, you can revise the story, lyrics, or musical direction and generate another preview. We allow unlimited free 60-second previews because charging for every attempt would make people cautious at exactly the point where they need room to experiment. You pay when you decide a finished version is worth keeping, at roughly the cost of a cup of coffee.

I care about that model because a personalized product creates a peculiar kind of pressure. When the result is meant for someone you love, "good enough" is difficult to accept. The pricing should not punish you for noticing.

## An audio file is not quite a gift

![Screenshot placeholder: the lyric wall art editor, music video preview, and share page.](REPLACE_WITH_WALL_ART_AND_MUSIC_VIDEO_SCREENSHOT_URL)

After finishing the first version, I ran into a final problem. I had a song I liked, but sending an audio file through a chat app felt oddly unfinished. The song needed a form that made the delivery feel intentional.

One Custom Song can turn the finished lyrics into printable lyric wall art. The export is prepared at 300 PPI, so it can become a framed print at home or a display piece at a wedding. People can choose the size and style that suit the occasion, then download the print-ready file.

The music video editor combines the song with lyrics, cover artwork, and personal photos. We use Remotion to render a high-resolution video that plays cleanly on a phone, tablet, computer, or a larger screen at an event. A couple could send it privately, play it during a proposal, or include it in a wedding reception. People will find their own occasion for it. Our job is to make sure the video is ready when that occasion arrives.

Each song also has a dedicated sharing page. You can send the link immediately or keep it to yourself until the date you had in mind.

## What I wanted AI to do, and what I did not

AI cannot care about another person on your behalf. It does not know why a rainy afternoon five years ago still matters, and it cannot decide which memory will make someone laugh before they cry.

What it can do is remove much of the technical friction between having something to say and turning it into music. It can give a non-musician a place inside the creative process. That is a smaller claim than "AI can write love songs," but I think it is a more useful one.

I began this project because I could not find a Valentine's Day gift that carried the shape of my own relationship. Building it changed how I judge personalized gifts. I care less now about whether the object looks expensive or spectacular. I care about whether it holds a detail that would otherwise disappear into everyday life.

If you are trying to make something for Valentine's Day, an anniversary, a wedding, or an ordinary day that happens to matter, start with one specific memory. Write it down without trying to make it beautiful. You can work on the song after that.

[Create your custom song](https://onecustomsong.com/create-song)
