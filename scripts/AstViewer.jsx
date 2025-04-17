import React, { useState, useEffect } from "react";
import Tree from "react-d3-tree";

function transformToTree(node, name = "root") {
  if (!node || typeof node !== "object") return { name };

  const children = Object.entries(node).map(([key, value]) => {
    if (Array.isArray(value)) {
      return {
        name: key,
        children: value.map((item, i) => transformToTree(item, `${key}[${i}]`)),
      };
    } else if (typeof value === "object") {
      return transformToTree(value, key);
    } else {
      return { name: `${key}: ${JSON.stringify(value)}` };
    }
  });

  return { name, children };
}

const ASTViewer = ({ file = "BoardingPass.ast.json" }) => {
  const [treeData, setTreeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const path = `/asts/${file}`;
    console.log(`Fetching AST file from: ${path}`);

    fetch(path)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Successfully fetched AST file:", file);
        setTreeData([transformToTree(data)]);
        setError(null);
      })
      .catch((err) => {
        console.error("Error loading AST file:", err);
        setError(err.message);
        setTreeData(null);
      });
  }, [file]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {error ? (
        <p style={{ color: "red" }}>❌ Error: {error}</p>
      ) : treeData ? (
        <Tree data={treeData} orientation="vertical" nodeSize={{ x: 300, y: 200 }} // Increase spacing between nodes
        separation={{ siblings: 1.5, nonSiblings: 2 }}/>
      ) : (
        <p>🔄 Loading AST...</p>
      )}
    </div>
  );
};

export default ASTViewer;