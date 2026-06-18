FERU AI REEL — ADD SOUND
=========================

Drop two files in THIS folder (video/public/):

  1. voiceover.mp3   — the female voiceover (~30s), generated from the script below
  2. music.mp3       — a royalty-free background track (~30s)

Then:
  - Open  video/src/FeruReel.tsx
  - Change   const INCLUDE_AUDIO = false;   to   true
  - Re-render:   cd video  &&  npm run build:reel
  - Output:  video/out/feru-reel.mp4   (now with sound)

Music volume is pre-set low (0.18) so it sits under the voice.


FEMALE VOICEOVER SCRIPT (timed to the visuals, ~30s)
----------------------------------------------------
0.0s  "Be honest — how many things did you forget this week?"
3.7s  "Your brain wasn't built to hold it all. Meet Feru AI."
7.0s  "It lives right inside your WhatsApp. Just text it like a friend —
       and it never forgets."
13.0s "Type it, say it, or even screenshot it — Feru turns anything
       into a reminder."
18.7s "Then it reminds you at the perfect time, everywhere you are."
23.7s "Free your mind. Try Feru AI free for seven days —
       just message us on WhatsApp."

Voice direction: warm, friendly, upbeat but calm. Smile in the voice.
Generate with ElevenLabs (try voices "Jessica" or "Rachel") or any TTS,
export as MP3, name it voiceover.mp3.

Music: search "uplifting modern pop" / "smooth corporate" ~100-110 BPM on
Pixabay, Uppbeat, or your IG in-app audio. Keep it light and clean.
