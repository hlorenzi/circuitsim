import { CircuitEditor } from "./circuitEditor.js"
import { UIToolbar } from "./uiToolbar.js"


let gEditor = null


document.body.onload = function()
{
	gEditor = new CircuitEditor(document.getElementById("canvasMain"))
	gEditor.run()
	
	const urlData = getURLQueryParameter("circuit")
	if (urlData != null)
		gEditor.loadFromString(urlData)
	
	onResize()
	window.onresize = (ev) => onResize()
	
	const saveToURL = () =>
	{
		let urlWithoutQuery = [location.protocol, "//", location.host, location.pathname].join("")
		window.location = urlWithoutQuery + "?circuit=" + gEditor.saveToString()
	}
	
	ReactDOM.render(React.createElement(UIToolbar, { editor: gEditor, saveToURL }), document.getElementById("divToolbox"))
}


function onResize()
{
	const divEditor = document.getElementById("divEditor")
	gEditor.resize(divEditor.clientWidth, divEditor.clientHeight)
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