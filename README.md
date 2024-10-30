# Toy-Drone

This was quite a challenge for someone that is both relatively new to web development and very rusty at web development as it has been several months since I worked in anything related to HTML, CSS and JavaScript.
It was a fun challenge that I tackled with all I could, I learned a great deal in the process.

I decided to work from what I know due to my experience in C# and represented the drone as a class to store its HTML element, position, rotation and other methods to keep all drone related info in one place, I also created classes to use 2D Vectors and Headings, as I called them, storing the 2D vector of the direction and the corresponding rotation with methods of influencing either class included.

On the day before this submission I carried out a major refactor to better follow javascript best practices as a friend of mine had pointed out, "Why are there so many global variables" which I then took to fixing by referencing variables only when needed within the various functions.

Finally I made the drone sprite in affinity designer and imported it as a sprite to add some visual flavour, as well as an animated star field.

There were still things I wasn't able to perfect, like the grid overlapping the header at admittedly edge case resolutions and the footer buttons not being properly centered on mobile devices.
 
## Keyboard Input
|Key|Action|
|---|---|
|Enter|PLACE|
|ArrowUp|MOVE|
|ArrowLeft|LEFT|
|ArrowRight|RIGHT|
|ArrowDown|ATTACK|
