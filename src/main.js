import { CircuitEditor } from "./circuitEditor.js"
import { ComponentWire } from "./componentWire.js"
import { ComponentBattery } from "./componentBattery.js"
import { ComponentResistor } from "./componentResistor.js"
import { ComponentCurrentSource } from "./componentCurrentSource.js"
import { ComponentCapacitor } from "./componentCapacitor.js"
import { ComponentInductor } from "./componentInductor.js"



let gEditor = null
let gButtonTools = []


document.body.onload = function()
{
	gEditor = new CircuitEditor(document.getElementById("canvasMain"))
	gEditor.run()
	
	onResize()
	window.onresize = (ev) => onResize()
}


function onResize()
{
	const divEditor = document.getElementById("divEditor")
	gEditor.resize(divEditor.clientWidth, divEditor.clientHeight)
}


function addTool(iconSrc, component)
{
	let button = document.createElement("button")
	button.className = "buttonTool"
	
	if (component == null)
		button.className += " buttonToolSelected"
	
	let img = document.createElement("img")
	img.className = "buttonToolIcon"
	img.src = iconSrc
	button.appendChild(img)
	
	document.getElementById("divToolbox").appendChild(button)
	
	gButtonTools.push(button)
	
	button.onclick = () =>
	{
		for (let bt of gButtonTools)
			bt.className = "buttonTool"
		
		button.className = "buttonTool buttonToolSelected"
		gEditor.mouseAddComponentClass = component
	}
}


addTool("assets/icon_grab.png", null)
addTool("assets/icon_wire.png", ComponentWire)
addTool("assets/icon_battery.png", ComponentBattery)
addTool("assets/icon_resistor.png", ComponentResistor)
addTool("assets/icon_currentsource.png", ComponentCurrentSource)
addTool("assets/icon_capacitor.png", ComponentCapacitor)
addTool("assets/icon_inductor.png", ComponentInductor)

