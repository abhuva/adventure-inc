## boss respawn timer

the final room in a dungeon with the boss could be set on a respawn timer (most likely days).

Maybe interesting for a couple very rare and high value encounters?
Overall it just slows progression down. But it also allows for upgrades, like increased respawn time or skip respawn after x steps (once)



## items

base items are coming from the workshops (we do not drop items in dungeons, only materials)
But they are individual pieces and can be further customized.

here we can test things like augments (changing properties of the item, adding some are removing some, add unique skills etc.)
we can make this like in grimdawn, a rather deterministic way of crafting.

The used materials (augments) can be crafted in an alchemy workshop (with maybe a different mechanic than the woodworking one)


## dungeons

use the galaxy idea from space idle.
Essentially we have a node based plan with different options for routes.
We replace the "flleet fuel" with "Confidence". This is our main resource for dungeons.
The higher our confidence, the deeper i can go in a dungeon.

dungeon nodes can be like now (traps, fights, skill checks,) but also  eupgrades, special hard bossfights where there is unique boss thats one -time kill only (like the boss battles in the galaxies) wich then unlocks powerful rewards like skill or gameplay unlocks.

the idea is to make the dungeon more meaningful.

it should not be possible at the start to even go deep in the dungeon (even if you could kill). each step / action / fight will conume confidence.
(maybe there is a better word than confidence, its a meter of what the hero is willing to do before he decides its too much and back out)

Confidence could be an individual stat.
Then after each fight/action and the confidence tick, we would check wich one of the heroes is still willing for the next round (so it could be we start with 4 but end up with 1 because the other dropped out at some point because of their lower confidence)

special loot - not actually loot, but we can have nodes that give a dungeon only resource (basically exp for the dungeon) and with that we have a little skill tree that actually unlocks items/blueprints etc.

## alchemy

similar mechanic maybe like workshops?
The goal is to turn special resources into augments etc. 
resources needs to be crafted, augments needs then to be crafted 
you find new augments blueprints in dungeons?

## gym

treining area in town where parties can be assigned to.
staying here slowly increases stats like confidence. and also normal stats? maybe choose wich ones to train on.


## prestige system

instead of a simple reset - we frame this as "expansion to a new continent"
we can pick a couple heroes to come with us (wich gives us a huge headstart)
the rest does reset or change (new map, new dungeons etc.)
we can also add/remove game-mechanics to alter the way its played.

dungeons in the new continent can be harder by default, much so that its needed to use training grounds/gym for new adventurers first as there are no suitable starting dungeons anymore.

## army

maybe a stupid idea - but packing together a bunch of parties to vastly increase the force - and with such a huge force attacking special locations

## map

Use a heightmap / colormap / slopemap etc from worldmachine (similar to how i handle this in scaedumar).
we use this to calculate a full dijkstra map (can be even done in lower resolution) - and use this to let the partys actually traverse the terrain.
Then we can utilize height and slope caps to restrict heros from certain places (or make it more difficult to reach)

This could eventually lead into a more proper pre-planning, where the way to the dungeon also is an obstacle (need certain min skills in climbing or similar), dwarfs or certain other races could have a natural benefit (higher base stat, more options in the skill tree) so that dungeon in high/steep places are soft locked to certain races (while others can do it too with more investment into it)

Once traveling is more interesting in terms of management, we can also introduce chaining more dungeons - this way a strong party can optimize certain runs. Here we would most likely check how we do the pathfinding overall in scaedumar, as we have a solution for chained paths there already (wich needs to be adapted of course, not taken 1:1)

## mini achievements per adventurer / personal quest

each adventurer could have a certain set of "achievements", checkpoints to unlock like "kill x amount skeletons" or "chain these 3 dungeons and clear them fully (alone or in a party)" or "be in an all female group (as a female char)" or "beat the elf dungeon with a dwarves only party" - stuff like this.

This could be used to give the character a bit more depth and lore. It can be accompanied in the achievement description by a little flavor text.

Overall the idea is to make the chars a bit more unique and the player potentially more attached to them


## dungeon upgrades

in later continents we can find blueprints/unlocks to upgrade dungeons of Tier X  (so we can find higher ones later or upgrade)
these unlock the option to "upgrade a dungeon" if it fits the requirement. This could simply turn it more dangerous by increasing the stats and rewards. It could also unlock some new nodes or more dungeon skill-tree upgrades

This allows early game content to be re-used later in meaningfuls ways.