import "core-js"
import "regenerator-runtime/runtime"


import React from "react"
import ReactDOM from "react-dom"
import { CircuitEditor } from "./circuitEditor.js"
import { UIToolbar } from "./uiToolbar.js"
import { UIEditBox } from "./uiEditBox.js"


let gEditor = null


document.body.onload = function()
{
	gEditor = new CircuitEditor(document.getElementById("canvasMain"))
	gEditor.run()
	
	ReactDOM.render(<UIToolbar editor={ gEditor } saveToURL={ saveToURL }/>, document.getElementById("divToolbox"))
	
	gEditor.refreshUI = refreshUI
	
	onResize()
	document.body.onresize = (ev) => onResize()
	
	const urlData = getURLQueryParameter("circuit")
	if (urlData != null)
		gEditor.loadFromString(urlData)
}


function refreshUI()
{
	ReactDOM.render(
		<UIEditBox
			editor={ gEditor }
			onChange={ () => { gEditor.refreshSolver(); refreshUI() } }
			onDelete={ () => { gEditor.removeComponentsForEditing(); refreshUI() } }
		/>,
		document.getElementById("divFloatingEditBox"))
}


function onResize()
{
	const divEditor = document.getElementById("divEditor")
	const rect = divEditor.getBoundingClientRect()
	gEditor.resize(Math.floor(rect.width), Math.floor(rect.height))
}


function saveToURL()
{
	const url = [location.protocol, "//", location.host, location.pathname].join("")
	window.location = url + "?circuit=" + gEditor.saveToString()
}


function getURLQueryParameter(name)
{
	const url = window.location.search
	
	name = name.replace(/[\[\]]/g, "\\$&")
	
	const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
	const results = regex.exec(url)
	
	if (!results)
		return null
	
	if (!results[2])
		return ""
	
	return decodeURIComponent(results[2].replace(/\+/g, " "))
}