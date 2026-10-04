# BitNode 16: The Need for a Boss

BitNode 16 takes place on a world where Megacorporations took over the planet's economy, industry, supply chains... and the
well-desired augmentations. Rumors say that one corporation made it to steal _The Red Pill_ from the Daedalus faction. It seems there is no turning back...

Small corporations, such as VitaLife, Nova Medical and Global Pharmaceutical join together as a faction. Working on one of those
companies will reward you with a little bit of reputation. Other Faction work remains unaltered.

A complete NS API documentation exists [here](../../../../../markdown/bitburner.boss.md).

### Purpose

In this BitNode, jobs have been replaced with a meetings scheduler. You must organize your agenda in order to attend the maximum number of meetings possible. Every attended meeting gives a bonus, but some unattended ones may penalize you. Be warned! You will not be able to attend to all meetings, so choose wisely to which meetings you will attend. Will you be able to make the maximum profit in order to escape this reality?

### Attendance

A Meeting is attended when you click it on the UI or use the API to do so. An attended meeting will provide you with its rewards at
the end of the round. A meeting can always be cancelled.
_Note:_ in the API, we use `rsvp` to refer to the act of atttending a specific meeting.

### Agents

...

### Break Time

You have a lunch break locked

### Quirks

- All non-corporative factions will not offer any augmentations except NeuroFlux Governor. The same applies to corporative factions, they do not offer NFG.
- Climb through the positions of a company by solving coding puzzles. You will still need the required reputation.
- Various factions will be unlocked.
- Earnings from other sources except company jobs have been heavily buffed.

### API Summary

When you applly for a company job and set to work, a calendar appears. You will see all the meetings you can attend in the current
round. To fetch all the meetings, use `ns.boss.getAppointments()`. To attend a meeting, either click it in the UI or use
`ns.boss.rsvp()`. You can get all attended meetings using `ns.boss.getRsvps()`, which returns an array of Meeting IDs. You can
check if a meeting is attended using `ns.boss.isMeetingAttended()` and cancel an attendance with `ns.boss.cancelMeetingAttendance()`. To check the accumulated rewards of the current round, use `ns.getPendingRewards`.

### Useful notes

- The meetings object returned by the API will normally be a `Meeting[]`, but in order to access a specific meeting(s) you must use its ID.
