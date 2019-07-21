import React from "react"
import { ComponentWire } from "./componentWire.js"
import { ComponentBattery } from "./componentBattery.js"
import { ComponentResistor } from "./componentResistor.js"
import { ComponentCurrentSource } from "./componentCurrentSource.js"
import { ComponentCapacitor } from "./componentCapacitor.js"
import { ComponentInductor } from "./componentInductor.js"
import { ComponentVoltageSource } from "./componentVoltageSource.js"
import { ComponentGround } from "./componentGround.js"


export class UIToolbar extends React.Component
{
	constructor(props)
	{
		super(props)
		this.state = { currentComponent: null }
	}
	
	
	render()
	{
		return <React.Fragment>
			{ this.makeMenuItem("Save to URL", this.props.saveToURL) }
			<br/>
			{ this.makeToolButton("assets/icon_grab.png", null) }
			{ this.makeToolButton("assets/icon_wire.png", ComponentWire) }
			{ this.makeToolButton("assets/icon_battery.png", ComponentBattery) }
			{ this.makeToolButton("assets/icon_resistor.png", ComponentResistor) }
			{ this.makeToolButton("assets/icon_currentsource.png", ComponentCurrentSource) }
			{ this.makeToolButton("assets/icon_capacitor.png", ComponentCapacitor) }
			{ this.makeToolButton("assets/icon_inductor.png", ComponentInductor) }
			{ this.makeToolButton("assets/icon_voltagesource.png", ComponentVoltageSource) }
			{ this.makeToolButton("assets/icon_ground.png", ComponentGround) }
		</React.Fragment>
	}
	
	
	makeMenuItem(text, onClick)
	{
		return <button className="toolbarButton" onClick={ onClick }>{ text }</button>
	}
	
	
	makeToolButton(iconSrc, componentClass)
	{
		const onClick = () =>
		{
			this.props.editor.mouseAddComponentClass = componentClass
			this.setState({ currentComponent: componentClass })
		}
		
		const isCurrent = (this.state.currentComponent == componentClass)
		
		return <button
			key={ iconSrc }
			className={ "buttonTool" + (isCurrent ? " buttonToolSelected" : "") }
			title={ componentClass ? componentClass.getName() : "Grab/Move" }
			onClick={ onClick }>
				<img className="buttonToolIcon" src={ iconSrc }/>
			</button>
	}
}