import { ComponentWire } from "./componentWire.js"
import { ComponentBattery } from "./componentBattery.js"
import { ComponentResistor } from "./componentResistor.js"
import { ComponentCurrentSource } from "./componentCurrentSource.js"
import { ComponentCapacitor } from "./componentCapacitor.js"
import { ComponentInductor } from "./componentInductor.js"
import { ComponentVoltageSource } from "./componentVoltageSource.js"


export class UIToolbar extends React.Component
{
	constructor(props)
	{
		super(props)
		this.state = { currentComponent: null }
	}
	
	
	render()
	{
		return [
			this.makeMenuItem("Save to URL", this.props.saveToURL),
			React.createElement("br"),
			this.makeToolButton("assets/icon_grab.png", null),
			this.makeToolButton("assets/icon_wire.png", ComponentWire),
			this.makeToolButton("assets/icon_battery.png", ComponentBattery),
			this.makeToolButton("assets/icon_resistor.png", ComponentResistor),
			this.makeToolButton("assets/icon_currentsource.png", ComponentCurrentSource),
			this.makeToolButton("assets/icon_capacitor.png", ComponentCapacitor),
			this.makeToolButton("assets/icon_inductor.png", ComponentInductor),
			this.makeToolButton("assets/icon_voltagesource.png", ComponentVoltageSource),
		]
	}
	
	
	makeMenuItem(text, onClick)
	{
		return React.createElement("a",
			{ className: "buttonMenu", onClick },
			text)
	}
	
	
	makeToolButton(iconSrc, componentClass)
	{
		const onClick = () =>
		{
			this.props.editor.mouseAddComponentClass = componentClass
			this.setState({ currentComponent: componentClass })
		}
		
		const isCurrent = (this.state.currentComponent == componentClass)
		
		return React.createElement("button",
			{ className: "buttonTool" + (isCurrent ? " buttonToolSelected" : ""), onClick },
			React.createElement(
				"img",
				{ className: "buttonToolIcon", src: iconSrc })
		)
	}
}