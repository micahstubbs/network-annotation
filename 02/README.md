## Using collision detection with network visualization labels

This demonstrates how to use [d3-annotation()](https://github.com/susielu/d3-annotation/) with `bboxCollide` to procedurally place node labels. After using the nodes data to create a network visualization of the Les Miserables play, we filter the nodes to leave out the side characters and pass that array to `d3-annotation`. We then create a second `forceSimulation`, this time using the size of the notes as the property in our bounding box collision detection, to move the labels out of each others' way.

`d3-annotation` by [Susie Lu](https://twitter.com/datatoviz).