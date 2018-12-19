import { CircuitEditor } from "./circuitEditor.js"
import { UIToolbar } from "./uiToolbar.js"


let gEditor = null


document.body.onload = function()
{
	gEditor = new CircuitEditor(document.getElementById("canvasMain"))
	gEditor.run()
	
	onResize()
	window.onresize = (ev) => onResize()
	
	ReactDOM.render(React.createElement(UIToolbar, { editor: gEditor }), document.getElementById("divToolbox"))
}


function onResize()
{
	const divEditor = document.getElementById("divEditor")
	gEditor.resize(divEditor.clientWidth, divEditor.clientHeight)
}

