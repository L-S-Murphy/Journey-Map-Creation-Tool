const mindMapContainer =  document.getElementById('mind-map');
const nodes = document.getElementsByClassName('mind-map-nodes');
const nodeInputTitle = document.getElementById('node-title');
const nodeDropdown = document.getElementById('node-dropdown')
const deleteButton = document.getElementById('delete-button')
const textContent = document.getElementById('input-container')
const hideButton = document.getElementById('hide-control')
const controlTab = document.getElementById('control-tab')
const connectionButton = document.getElementById('add-connection')
const fromText = document.getElementById('connect-from')
const goText = document.getElementById('connect-to')
const sheet = document.styleSheets[0];
const saveButton = document.getElementById('save-container')
const exportButton = document.getElementById('export-container')

const controlTabChildren = controlTab.childNodes
let showControlTab = true;
// Function to get the center position of an element by its ID
function getElementCenterPosition(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

// Function to create an SVG line element (arrow)
function createSVGArrow(x1, y1, x2, y2) {
    const svgNS = "http://www.w3.org/2000/svg";
    const arrow = document.createElementNS(svgNS, "line");
    arrow.setAttribute("x1", x1);
    arrow.setAttribute("y1", y1);
    arrow.setAttribute("x2", x2);
    arrow.setAttribute("y2", y2);
    arrow.setAttribute("stroke", "black");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("marker-end", "url(#arrowhead)"); // Add arrowhead at the end of the line
    return arrow;
}

// Function to create the arrowhead marker
function createArrowheadMarker(svg) {
    const svgNS = "http://www.w3.org/2000/svg";
    const marker = document.createElementNS(svgNS, "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "10");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M0,0 L10,3.5 L0,7 Z"); // Triangle shape for arrowhead
    path.setAttribute("fill", "black");

    marker.appendChild(path);
    svg.appendChild(marker);
}

// Main function to draw the arrows
function drawArrows(nodeFrom, nodeTo, name) {
    // Ensure there's an SVG element in the document for arrows
    let svg = document.getElementById(name);
    if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("id", name);
        svg.setAttribute("style", "position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;");
        document.body.appendChild(svg);

        // Create the arrowhead marker in the SVG
        createArrowheadMarker(svg);
    }

    // Clear previous arrows
    svg.innerHTML = ''; 

    // Loop through nodeFrom object
    for (let key in nodeFrom) {
        const keyPosition = getElementCenterPosition(key);
        if (!keyPosition) continue; // Skip if the key element doesn't exist

        nodeFrom[key].forEach(valueId => {
            const valuePosition = getElementCenterPosition(valueId);
            if (valuePosition) {
                const midX = (keyPosition.x + valuePosition.x) / 2;
                const midY = (keyPosition.y + valuePosition.y) / 2;

                const arrow = createSVGArrow(valuePosition.x, valuePosition.y, midX, midY);
                svg.appendChild(arrow);
            }
        });
    }

    // Loop through nodeTo object (drawing in reverse)
    for (let key in nodeTo) {
        const keyPosition = getElementCenterPosition(key);
        if (!keyPosition) continue;

        nodeTo[key].forEach(valueId => {
            const valuePosition = getElementCenterPosition(valueId);
            if (valuePosition) {
                const midX = (keyPosition.x + valuePosition.x) / 2;
                const midY = (keyPosition.y + valuePosition.y) / 2;

                const arrow = createSVGArrow(keyPosition.x, keyPosition.y, midX, midY);
                svg.appendChild(arrow);
            }
        });
    }
}

// Call the function to draw arrows using nodeFrom and nodeTo
// Assuming nodeFrom and nodeTo are defined elsewhere in your script.



// const nodeTitle
let nodeInstance = 1;
let relativeX;
let relativeY;
let isDragging;
let selectedNode;
let selectedNodeTitle;
let selectedNodeText;
let showControl;
// Relevant for adding connections
let addConnection;
let fromSelected;
let goTo;
let comeFrom;
// array value -> key
let nodeFrom ={};
// key -> array value
let nodeTo = {};
let allKeys = [];
let oldTitle;

function updateKeys (prevID, curID) {
 // updates the key
    let index = allKeys.indexOf(prevID);
    allKeys[index] = curID;
    nodeTo[curID] = nodeTo[prevID];
    delete nodeTo[prevID];
    nodeFrom[curID] = nodeFrom[prevID];
    delete nodeFrom[prevID];
    
    // changes values within keys
    for (let i = 0; i< allKeys.length; i++) {
        let currentValues = nodeFrom[allKeys[i]];
        if (currentValues.includes(prevID)) {
            index = currentValues.indexOf(prevID);
            nodeFrom[allKeys[i]][index] = curID;
        }
        currentValues = nodeTo[allKeys[i]];
        if (currentValues.includes(prevID)) {
            index = currentValues.indexOf(prevID);
            nodeTo[allKeys[i]][index] = curID;
        }
    }

   
    }

// Updates all the selectable content within the control container to ensure it matches the selected node
function updateControlContainer() {
    nodeInputTitle.value = selectedNode.id;
    // The second class in the list should always be the type of node
    nodeDropdown.value = selectedNode.classList[1];
    // Currently, each nodes only have one child which is the textarea
    // const nodeTextARea = selectedNode.childNodes[1];
    textContent.value = selectedNodeText.value
    // Clearing the connections text
    fromText.replaceChildren();
    goText.replaceChildren();
    // Adding the text if there are any connections
    fromText.textContent = nodeFrom[selectedNode.id];
    goText.textContent = nodeTo[selectedNode.id];
    drawArrows(nodeFrom,nodeTo,'quick');
    drawArrows(nodeTo,nodeFrom,'fix');
}



// Displays and hides the control tab
hideButton.addEventListener('click', function () {
    if (controlTab.style.display == 'none')
        {
        controlTab.style.display = 'flex'
    }
    else {
        controlTab.style.display = 'none'

    }
    drawArrows(nodeFrom,nodeTo,'quick');
    drawArrows(nodeTo,nodeFrom,'fix');
})



function createNode (title) {
    // Creates the Div (the actual node)
    selectedNode = document.createElement('div');
    selectedNode.style.left = relativeX + 'px';
    selectedNode.style.top = relativeY + 'px';
    selectedNode.classList.add('mind-map-nodes');
    selectedNode.classList.add('event');
    selectedNode.id = title;
    allKeys.push(title)
    selectedNode.style.zIndex = nodeInstance;
    mindMapContainer.appendChild(selectedNode);
    // Adds a title on top
    selectedNodeTitle = document.createElement('textarea');
    selectedNodeTitle.value = title;
    selectedNodeTitle.className = 'node-title'
    selectedNode.appendChild(selectedNodeTitle);
    // Adds the text area to the node
    selectedNodeText = document.createElement('textarea');
    selectedNodeText.className = 'node-description'
    selectedNode.appendChild(selectedNodeText);
    nodeFrom[title] = [];
    nodeTo[title] = [];
    

}

// Creates a node
mindMapContainer.addEventListener('dblclick',function(e) {
    // Makes sure we're only clicking within the interaction area, instead of
    if (/mind-map/.test(e.target.id)) {
        // Gets position of mouse cursor
        relativeX = e.offsetX;
        relativeY = e.offsetY;
        // Asks user for basic inputs:
        let title = prompt("Name of Node")
        // alert(title)
        // Checks if the user named the title. If not, gives a generic title name
        if (!title) {
            title = "Title " + nodeInstance 
            alert("Default Title: " + title)
            nodeInstance = nodeInstance + 1;
    }

    createNode(title)
    updateControlContainer()
}
})

// Updates the ID of the selected node/node when changing the Node Title in the control tab
nodeInputTitle.addEventListener('input', function() {
    // updateKeys(selectedNodel.id, nodeInputTitle.value)
    oldTitle = selectedNode.id;
    selectedNode.id = nodeInputTitle.value;
    selectedNode.children[0].value = nodeInputTitle.value;
    updateKeys(oldTitle, selectedNodeTitle.value)
    drawArrows(nodeFrom,nodeTo,'quick');
    drawArrows(nodeTo,nodeFrom,'fix');
    }
    
)



// A function that updates the name of the object ID upon a change.



// Updates the Node Type when the node type is changed in the dropdown menu
nodeDropdown.addEventListener('change', function() {
    nodeDropdown.value
    selectedNode.className = 'mind-map-nodes ' + nodeDropdown.value;
})








// The below code handles dragging capability mainly, but also some other thing.

document.addEventListener('mousedown', function(e) {
    // Using regex, detects whether the class was selected
    targetElement = e.target;
    if (/mind-map-nodes/.test(targetElement.classList[0]))
    {
        // selecting the node
        selectedNode = targetElement;
        // alert(selectedNode)
        isDragging = true;
        // This returns a DOM which contains the coordinates relative to the top-left coordinate of the viewport for the selected element (in this case, the selected node)
        let rect = selectedNode.getBoundingClientRect(); 
        // Returns the absolute position inside the node container
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        updateControlContainer();
        
    }

    // Checks if the parent container is the mind-map container (obviously means that the text area or in future, or !)
    else if (/mind-map-nodes/.test(targetElement.parentElement.className)) {
        selectedNode = targetElement.parentElement;
        selectedNodeTitle = selectedNode.children[0];
        selectedNodeText = selectedNode.children[1];
        
        // If the add connection feature is turned on
        if (addConnection) {
            if (comeFrom && !(comeFrom == selectedNode.id))  {
                goTo = selectedNode.id;

                if (!(nodeFrom[goTo].includes(comeFrom) || nodeFrom[comeFrom].includes(goTo)  )) {
                    nodeFrom[goTo].push(comeFrom);
                    nodeTo[comeFrom].push(goTo);
                    addConnection = false;
                    connectionButton.style.backgroundColor = ''
                    connectionButton.textContent = 'Add Connection'
                    }
                fromSelected = false;
                comeFrom = null;
                goTo = null;
            }
            else {
                comeFrom = selectedNode.id;
            }
        }
        updateControlContainer();
    }
    // The uupdate container function goes on the inside to avoid errors when there is nothing selected.
})

// When any input type of device is selected on the website
document.body.addEventListener('input', function (e) {
        element = e.target
        // Checks if the selected node text was change
        if (element.className == "node-description")
        {
            
            updateControlContainer();
        }
        // Checking on the title
        else if (element.className == 'node-title') {
            oldTitle = selectedNode.id;
            selectedNode.id = selectedNodeTitle.value;
            updateControlContainer();
            // needs to be at bottom cause error and too lazy to do error handling here (whether there are any connections in first place)
            updateKeys(oldTitle, selectedNodeTitle.value)
            drawArrows(nodeFrom,nodeTo,'quick');
            drawArrows(nodeTo,nodeFrom,'fix');
        }

})


document.addEventListener('mousemove', function(e) {
    // Using regex, detects whether the class was selected
    if (isDragging) {
        e.preventDefault();
        // Get container's bounding rect for proper positioning
        let containerRect = mindMapContainer.getBoundingClientRect();
    
        // Calculate the new position of the node
        let newX = e.clientX - containerRect.left - offsetX;
        let newY = e.clientY - containerRect.top - offsetY;
    
        // If the viewport is smaller than the window, handles the node being dragged to the left and potentially being loss
        if (newX < 0) {
            newX = 0;
        }

        if (newY < 0) {
            newY = 0;
        }
        selectedNode.style.left = newX + 'px';
        selectedNode.style.top = newY + 'px';

        // Draw
        drawArrows(nodeFrom,nodeTo,'quick');
        drawArrows(nodeTo,nodeFrom,'fix');
    }
})


document.addEventListener('mouseup', function(e) {
    // Using regex, detects whether the class was selected
    isDragging = false
})


// This adds delete functionality

deleteButton.addEventListener('click', function() {
    removingElement = selectedNode.id;
    // Only need one of the sections but can't recall which one
    for (let i = 0; i< allKeys.length; i++) {
        let currentValues = nodeFrom[allKeys[i]];
        if (currentValues.includes(removingElement)) {
            index = currentValues.indexOf(removingElement);
            nodeFrom[allKeys[i]].splice(index,1)
        }
        currentValues = nodeTo[allKeys[i]];
        if (currentValues.includes(removingElement)) {
            index = currentValues.indexOf(removingElement);
            nodeTo[allKeys[i]].splice(index,1)
        }
    }

    selectedNode.remove();
     // Draw
     drawArrows(nodeFrom,nodeTo,'quick');
     drawArrows(nodeTo,nodeFrom,'fix');
    // nodeInstance--
    // updateControlContainer();


})

// On certain width, ensures that the control tab is always shown
// window.addEventListener('resize', function () {
//     if (window.innerWidth >= 1024) {
//         controlTab.style.display = 'flex'
//     }
// })


// Adds Connection capability
connectionButton.addEventListener('click', function (e) {
    if (addConnection) {
        addConnection = false;
        connectionButton.style.backgroundColor = ''
        connectionButton.textContent = 'Add Connection'
    }
    else {
        addConnection = true;
        connectionButton.style.backgroundColor = 'green'
        connectionButton.textContent = 'Adding Connection'
    }
})


saveButton.addEventListener('click', function (e) {
    // Clone the current document's HTML content
    const clonedDocument = document.documentElement.cloneNode(true);

    // Get all the textareas and input elements, and ensure their dynamic content is saved
    const textareas = document.querySelectorAll('textarea');
    const inputs = document.querySelectorAll('input');

    // Update the cloned HTML with current values from textareas and input fields
    textareas.forEach((textarea, index) => {
        const clonedTextarea = clonedDocument.querySelectorAll('textarea')[index];
        clonedTextarea.textContent = textarea.value;
    });

    inputs.forEach((input, index) => {
        const clonedInput = clonedDocument.querySelectorAll('input')[index];
        clonedInput.setAttribute('value', input.value);
    });

    // Prepare the JavaScript variables to be saved
    const state = {
        nodeFrom: nodeFrom,
        nodeTo: nodeTo,
        allKeys: allKeys,
        nodeInstance: nodeInstance,
        // Add other relevant variables here
    };

    // Create a <script> tag using the original document to embed the state in the saved HTML
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/json';
    scriptTag.id = 'savedState';
    scriptTag.textContent = JSON.stringify(state);

    // Add the <script> tag to the cloned HTML document (e.g., in the body)
    clonedDocument.querySelector('body').appendChild(scriptTag);

    // Serialize the updated document into a string
    const updatedHtmlContent = new XMLSerializer().serializeToString(clonedDocument);

    // Create a Blob object with the updated HTML content
    const blob = new Blob([updatedHtmlContent], { type: 'text/html' });

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Saved Journey Map with State.html';  // Filename for the download

    // Programmatically click the anchor to trigger the download
    a.click();

    // Clean up by revoking the object URL after the download
    URL.revokeObjectURL(a.href);
})



// Load the saved state from the embedded <script> tag when the page loads
window.addEventListener('load', function () {
    const savedStateScript = document.getElementById('savedState');
    if (savedStateScript) {
        const savedState = JSON.parse(savedStateScript.textContent);

        // Restore the variables
        nodeFrom = savedState.nodeFrom;
        nodeTo = savedState.nodeTo;
        allKeys = savedState.allKeys;
        nodeInstance = savedState.nodeInstance;
        // Restore other variables here

        // Optionally, redraw the nodes/connections using the restored state
        drawArrows(nodeFrom, nodeTo, 'quick');
        drawArrows(nodeTo, nodeFrom, 'fix');
    }
})
exportButton.addEventListener('click', function(e) {
    const nodes = document.querySelectorAll('.mind-map-nodes');
    const csvRows = [];

    // Headers for the CSV (for nodes and nodeTo data)
    let headers = ['Title', 'Text', 'Category'];

    // Get all unique keys from nodeTo
    const nodeToKeys = Object.keys(nodeTo);
    headers = headers.concat(nodeToKeys);  // Add the nodeTo keys as new columns

    // Add the headers to the CSV rows
    csvRows.push(headers.join(','));

    // Loop through all nodes and gather relevant information
    nodes.forEach(node => {
        const title = node.querySelector('.node-title').value;  // Node title
        const text = node.querySelector('.node-description').value;  // Node text/description
        const category = node.classList[1];  // The second class is the node category (e.g., event, thought, consequence)

        // Start forming a CSV row for this node
        let csvRow = [JSON.stringify(title), JSON.stringify(text), JSON.stringify(category)];

        // Add data from nodeTo for each key
        nodeToKeys.forEach(key => {
            if (nodeTo[key] && nodeTo[key].includes(node.id)) {
                const connections = nodeTo[key].join('|');  // Join multiple values with '|'
                csvRow.push(JSON.stringify(connections));
            } else {
                // Leave the cell empty if no connection for this node under this key
                csvRow.push('');
            }
        });

        // Add the completed row to the CSV
        csvRows.push(csvRow.join(','));
    });

    // Step 2: Create a Blob from the CSV string
    const csvString = csvRows.join('\n');  // Join all rows with newlines
    const blob = new Blob([csvString], { type: 'text/csv' });

    // Step 3: Create a temporary anchor element and trigger the download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'journey-map-nodes-with-connections.csv';  // Filename for the download

    // Programmatically click the anchor to trigger the download
    a.click();

    // Clean up by revoking the object URL
    URL.revokeObjectURL(a.href);
});
