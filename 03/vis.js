/* global d3 window makeAnnotations */
/* eslint-disable newline-per-chained-call */

    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const color = d3.scaleOrdinal(d3.schemeCategory20)
      .range(['#e91e56', '#00965f', '#00bcd4', '#3f51b5', '#9c27b0', '#ff5722', '#cddc39', '#607d8b', '#8bc34a']);
    const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id((d, i) => i))
        .force('charge', d3.forceManyBody().strength(-80))
        .force('center', d3.forceCenter(width / 2, height / 2));
    d3.json('graph.json', (error, graph) => {
      if (error) throw error;
      const link = svg.append('g')
          .attr('class', 'links')
        .selectAll('line')
        .data(graph.links)
        .enter().append('line')
          .attr('stroke-width', d => Math.sqrt(d.value));

      const node = svg.append('g')
          .attr('class', 'nodes')
        .selectAll('circle')
        .data(graph.nodes)
        .enter().append('circle')
          .attr('r', d => (d.type === 'major' ? 9 : 3))
          .style('fill', d => d3.hsl(color(d.group)).darker())
          .style('fill-opacity', d => (d.type === 'other' ? 0.5 : 1));

      node.append('title')
          .text(d => d.name);

      window.collide = d3.bboxCollide(a => [[a.offsetCornerX - 5, a.offsetCornerY - 10], [a.offsetCornerX + a.width + 5, a.offsetCornerY + a.height + 5]])
     .strength(0.5)
     .iterations(1);

      window.yScale = d3.scaleLinear();

      simulation
          .nodes(graph.nodes)
          .on('tick', ticked)
          .on('end', () => {
            const noteBoxes = makeAnnotations.collection().noteNodes;

            window.labelForce = d3.forceSimulation(noteBoxes)
              .force('x', d3.forceX(a => a.positionX).strength(a => Math.max(0.25, Math.min(3, Math.abs(a.x - a.positionX) / 20))))
              .force('y', d3.forceY(a => a.positionY).strength(a => Math.max(0.25, Math.min(3, Math.abs(a.x - a.positionX) / 20))))
             .force('collision', window.collide)
              .alpha(0.5)
              .on('tick', (d) => {
                makeAnnotations.annotations()
                  .forEach((d, i) => {
                    const match = noteBoxes[i];
                    d.dx = match.x - match.positionX;
                    d.dy = match.y - match.positionY;
                  });

                makeAnnotations.update();
              });
          });
      const nonOtherNodes = graph.nodes
        .filter(d => d.type !== 'other');

      simulation.force('link')
          .links(graph.links);
      function ticked() {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        makeAnnotations.annotations()
          .forEach((d, i) => {
            d.position = nonOtherNodes[i];
          });
      }

      window.makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(nonOtherNodes
        .map((d, i) => ({
          data: { x: d.x, y: d.y, group: d.group },
          note: { label: d.name,
            align: 'middle',
            orientation: 'fixed' },
          connector: { type: 'elbow' },
          className: d.type,
        })))
        .accessors({ x: d => d.x, y: d => d.y });

      svg.append('g')
        .attr('class', 'annotation-test')
        .call(makeAnnotations);

      svg.selectAll('.annotation-note text')
        .style('fill', d => color(d.data.group));

      svg.selectAll('.annotation-connector > path')
        .style('stroke', (d, i) => color(d.data.group));
    });
