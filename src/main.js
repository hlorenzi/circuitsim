import { CircuitEditor } from "./circuitEditor.js"
import { ComponentWire } from "./componentWire.js"
import { ComponentBattery } from "./componentBattery.js"
import { ComponentResistor } from "./componentResistor.js"
import { ComponentCurrentSource } from "./componentCurrentSource.js"



let gEditor = null


document.body.onload = function()
{
	gEditor = new CircuitEditor(document.getElementById("canvasMain"))
	gEditor.run()
}


function addTool(name, func)
{
	let button = document.createElement("button")
	button.innerHTML = name
	button.onclick = func
	
	document.body.appendChild(button)
}


addTool("Grab", () => gEditor.mouseAddComponentClass = null)
addTool("Draw Wire", () => gEditor.mouseAddComponentClass = ComponentWire)
addTool("Draw Battery", () => gEditor.mouseAddComponentClass = ComponentBattery)
addTool("Draw Resistor", () => gEditor.mouseAddComponentClass = ComponentResistor)
addTool("Draw Current Source", () => gEditor.mouseAddComponentClass = ComponentCurrentSource)

