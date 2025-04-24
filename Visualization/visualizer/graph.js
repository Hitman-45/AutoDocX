// Load JSON and draw
d3.json("functions.json").then(function (data) {
    const width = window.innerWidth;
    const height = 800;
    const svg = d3.select("svg");
  
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const nodes = [];
    const links = [];
    const nodeMap = {};
  
    // Build file nodes
    data.forEach(d => {
      if (!nodeMap[d.file_path]) {
        const fileNode = { id: d.file_path, type: "file" };
        nodes.push(fileNode);
        nodeMap[d.file_path] = fileNode;
      }
  
      const funcName = `${d.function_name}(${d.parameters})`;
      const funcNode = { id: funcName, type: "function" };
      nodes.push(funcNode);
      links.push({ source: d.file_path, target: funcName });
    });
  
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));
  
    const link = svg.append("g")
      .attr("stroke", "#aaa")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line");
  
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 6)
      .attr("fill", d => d.type === "file" ? "#1f77b4" : "#2ca02c")
      .call(drag(simulation));
  
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.id)
      .attr("font-size", 10)
      .attr("dx", 8)
      .attr("dy", ".35em");
  
    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
  
      node.attr("cx", d => d.x)
          .attr("cy", d => d.y);
  
      label.attr("x", d => d.x)
           .attr("y", d => d.y);
    });
  
    function drag(simulation) {
      return d3.drag()
        .on("start", event => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", event => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", event => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        });
    }
  });
  