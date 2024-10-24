# Journey Map Creator

## Overview
This **Journey Map Creator** is a browser-based application designed to help students, particularly in engineering, map out their educational journey. The tool allows users to visually represent important events, thoughts, and consequences related to their personal and professional development. 
It streamlines the process of journey map creation, which can be used for qualitative and quantitative analysis.

This project was created to support QUT's EGB101 unit to help students identify key experiences in their engineering journey.

## Features
- **Node Creation**: Users can create nodes representing events, thoughts, and consequences on a journey map.
- **Connections**: Nodes can be connected to show relationships and sequences of events.
- **Customizable Node Types**: Nodes are classified into events, thoughts, and consequences, each represented by different colors.
- **Interactive and Moveable Nodes**: Nodes can be moved freely on the map for customization and better visual representation.
- **Save and Export**: The tool allows saving the map and exporting it as a CSV file for easy data analysis.
\

### Setup Instructions
1. Download the entire project repository.
2. Extract the files.
3. Open the `journey.html` file in a web browser.

### Usage

1. **Create a Node**: 
   - Double-click anywhere inside the interaction area to create a new node.
   - Provide a title for the node. If you don’t provide a title, a default name will be assigned.
   - You can move the node around by dragging it to any position within the interaction area.

2. **Add Description and Classify Nodes**:
   - Click on a node to add a description in the "Text Content" area.
   - Select the node type (Event, Thought, or Consequence) from the dropdown menu. The colors will change based on the type: 
     - **Red** for Events
     - **Purple** for Thoughts
     - **Green** for Consequences

3. **Create Connections**:
   - Click the "Add Connection" button, then select two nodes to create a connection between them, showing the relationship or sequence.

4. **Save Your Map**:
   - Once you are satisfied with your journey map, click "Save Journey Map" to save it as an HTML file. Ensure the file is saved with the accompanying `styles.css` and `scripts.js` files for proper functionality.

5. **Export Data**:
   - To export your journey map data for analysis, click "Export Data." This will generate a CSV file containing node information and their connections in a structured format.

## Example
An example journey map is provided within the tool.

