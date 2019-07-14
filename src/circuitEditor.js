import { CircuitSolver } from "./circuitSolver.js"
import { ComponentSingleEnded } from "./componentSingleEnded.js"
import { ComponentDoubleEnded } from "./componentDoubleEnded.js"
import { ComponentWire } from "./componentWire.js"
import { ComponentBattery } from "./componentBattery.js"
import { ComponentResistor } from "./componentResistor.js"
import { ComponentCurrentSource } from "./componentCurrentSource.js"
import { ComponentCapacitor } from "./componentCapacitor.js"
import { ComponentInductor } from "./componentInductor.js"
import { ComponentVoltageSource } from "./componentVoltageSource.js"
import { ComponentGround } from "./componentGround.js"


export class CircuitEditor
{
	constructor(canvas)
	{
		this.canvas = canvas
		this.ctx = canvas.getContext("2d")
		this.width = parseInt(canvas.width)
		this.height = parseInt(canvas.height)
		
		this.tileSize = 25
		
		this.time = 0
		this.timePerIteration = 1e-6
		
		this.components = []
		this.componentsForEditing = []
		
		this.solver = new CircuitSolver()
		this.joints = new Map()
		this.nodes = []
		this.groundNodeIndex = -1
		this.voltageSources = 0
		
		this.mouseDown = false
		this.mousePos = null
		this.mouseDragOrigin = null
		this.mouseAddComponentClass = null
		this.mouseCurrentAction = null
		this.mouseCurrentHoverComponent = null
		this.mouseCurrentHoverData = null
		
		this.canvas.onmousedown  = (ev) => this.onMouseDown(ev)
		this.canvas.onmousemove  = (ev) => this.onMouseMove(ev)
		this.canvas.onmouseup    = (ev) => this.onMouseUp  (ev)
		this.canvas.onmouseleave = (ev) => this.onMouseUp  (ev)
		
		this.canvas.oncontextmenu = (ev) => ev.preventDefault()
		
		window.onkeydown = (ev) => this.onKeyDown(ev)
		
		this.refreshUI = () => { }
		
		this.debugDrawClean = false
		
		this.debugSkipIterationFrames = 0
		this.debugSkipIterationFramesCur = 0
	}
	
	
	run()
	{
		this.debugSkipIterationFramesCur++
		if (this.debugSkipIterationFramesCur >= this.debugSkipIterationFrames)
		{
			this.debugSkipIterationFramesCur = 0
			
			if (this.solver != null && this.solver.readyToRun && this.components.length > 0)
			{
				for (const component of this.components)
					component.solverFrameBegin(this, this.solver)
				
				const iters = 50
				const initialTime = this.time
				
				for (let iter = 0; iter < iters; iter++)
				{
					this.time = initialTime + iter * this.timePerIteration
					
					this.solver.beginIteration()
					
					for (const component of this.components)
						component.solverIterationBegin(this, this.solver)
					
					this.solver.solve()
					
					for (const component of this.components)
						component.solverIterationEnd(this, this.solver)
				}
				
				for (const component of this.components)
					component.solverFrameEnd(this, this.solver)
				
				this.time = initialTime + iters * this.timePerIteration
			}
			
			for (const component of this.components)
				component.updateCurrentAnim(this, 1)
		}
		
		this.render()
		window.requestAnimationFrame(() => this.run())
	}
	
	
	resize(width, height)
	{
		this.width = width
		this.height = height
		
		this.canvas.width = width
		this.canvas.height = height
		
		this.render()
	}
	
	
	getAbsolutePosition(pos)
	{
		const rect = this.canvas.getBoundingClientRect()
		return {
			x: pos.x + rect.left,
			y: pos.y + rect.top
		}
	}
	
	
	getMousePos(ev)
	{
		const rect = this.canvas.getBoundingClientRect()
		return {
			x: ev.clientX - rect.left,
			y: ev.clientY - rect.top
		}
	}
	
	
	snapPos(pos)
	{
		return {
			x: Math.round(pos.x / this.tileSize) * this.tileSize,
			y: Math.round(pos.y / this.tileSize) * this.tileSize
		}
	}
	
	
	onMouseDown(ev)
	{
		ev.preventDefault()
		
		if (this.mouseDown)
			return
		
		const pos = this.snapPos(this.getMousePos(ev))
		
		this.mouseDragOrigin = pos
		
		this.mouseDown = true
		this.componentsForEditing = []
		
		if (!ev.ctrlKey)// && (this.mouseCurrentHoverComponent == null || !this.mouseCurrentHoverComponent.isAnySelected()))
			this.unselectAll()
		
		if (ev.button != 0 && this.mouseCurrentHoverComponent != null)
		{
			this.componentsForEditing = [this.mouseCurrentHoverComponent]
		}
		
		else if (this.mouseAddComponentClass != null)
		{
			this.mouseCurrentAction = "drag"
			
			let component = new (this.mouseAddComponentClass)(pos)
			component.selected[1] = true
			component.dragStart()
			this.components.push(component)
		}
		
		else if (this.mouseCurrentHoverComponent != null)
		{
			for (let component of this.components)
				component.dragStart()
			
			if (this.mouseCurrentHoverData.kind == "full")
			{
				for (let i = 0; i < this.mouseCurrentHoverComponent.selected.length; i++)
					this.mouseCurrentHoverComponent.selected[i] = true
				
				for (let component of this.components)
					for (let i = 0; i < component.points.length; i++)
						for (let j = 0; j < this.mouseCurrentHoverComponent.points.length; j++)
						{
							if (component.points[i].x == this.mouseCurrentHoverComponent.points[j].x &&
								component.points[i].y == this.mouseCurrentHoverComponent.points[j].y)
								component.selected[i] = true
						}
			}
			else if (this.mouseCurrentHoverData.kind == "vertex")
			{
				this.mouseCurrentHoverComponent.selected[this.mouseCurrentHoverData.index] = true
			}
			else if (this.mouseCurrentHoverData.kind == "junction")
			{
				const x = this.mouseCurrentHoverComponent.points[this.mouseCurrentHoverData.index].x
				const y = this.mouseCurrentHoverComponent.points[this.mouseCurrentHoverData.index].y
				
				for (let component of this.components)
					for (let i = 0; i < component.points.length; i++)
					{
						if (component.points[i].x == x && component.points[i].y == y)
							component.selected[i] = true
					}
			}
		}
		
		this.refreshUI()
		this.render()
	}
	
	
	onMouseMove(ev)
	{
		ev.preventDefault()
		
		const pos = this.snapPos(this.getMousePos(ev))
		this.mousePos = pos
		
		this.mouseCurrentHoverComponent = null
		this.mouseCurrentHoverData = null
		
		if (this.mouseDown)
		{
			if (this.mouseCurrentAction = "drag")
			{
				const deltaPos = { 
					x: pos.x - this.mouseDragOrigin.x,
					y: pos.y - this.mouseDragOrigin.y
				}
				
				for (let component of this.components)
					component.dragMove(this, deltaPos)
			}
		
			this.refreshNodes()
			this.render()
		}
		
		else if (this.mouseAddComponentClass == null)
		{
			for (let component of this.components)
			{
				const hover = component.getHover(pos)
				if (hover == null)
					continue
				
				if (this.mouseCurrentHoverData == null ||
					hover.distSqr < this.mouseCurrentHoverData.distSqr)
				{
					this.mouseCurrentHoverData = hover
					this.mouseCurrentHoverComponent = component
				}
			}
		}
	}
	
	
	onMouseUp(ev)
	{
		ev.preventDefault()
		
		if (!this.mouseDown)
			return
		
		this.mouseDown = false
		this.removeDegenerateComponents()
		this.render()
	}
	
	
	onKeyDown(ev)
	{
		if (ev.key == "Delete" || ev.key == "Backspace")
		{
			ev.preventDefault()
			
			const hasOneFullySelected = this.components.reduce((acc, c) => acc || c.isFullySelected(), false)
			
			for (let i = this.components.length - 1; i >= 0; i--)
			{
				if ((hasOneFullySelected && this.components[i].isFullySelected()) ||
					(!hasOneFullySelected && this.components[i].isAnySelected()))
				{
					this.components.splice(i, 1)
				}
			}
			
			this.refreshNodes()
		}
	}
	
	
	unselectAll()
	{
		for (let component of this.components)
			for (let i = 0; i < component.selected.length; i++)
				component.selected[i] = false
	}
	
	
	removeDegenerateComponents()
	{
		for (let i = this.components.length - 1; i >= 0; i--)
		{
			if (this.components[i].isDegenerate())
				this.components.splice(i, 1)
		}
	}
	
	
	refreshNodes()
	{
		this.joints = new Map()
		this.nodes = [{}]
		this.groundNodeIndex = 0
		this.voltageSources = 0
		
		const jointKey = (p) => p.x / this.tileSize * 1000 + p.y / this.tileSize
		
		// Assign ground nodes.
		let hasGround = false
		for (let component of this.components)
		{
			if (component instanceof ComponentGround)
			{
				hasGround = true
				//const joint = { jointIndex: this.joints.size, nodeIndex: 0, pos: component.points[0], outgoingDirections: [], labelDirection: 0, visible: true }
				//this.joints.set(jointKey(component.points[0]), joint)
			}
		}
		
		// Assign ground node to a voltage source if no ground components.
		if (!hasGround)
		{
			for (let component of this.components)
			{
				if (component instanceof ComponentBattery || component instanceof ComponentVoltageSource)
				{
					const key = jointKey(component.points[0])
					
					let joint = this.joints.get(key)
					if (!joint)
					{
						joint = { jointIndex: this.joints.size, nodeIndex: 0, pos: component.points[0], outgoingDirections: [], labelDirection: 0, visible: true }
						this.joints.set(key, joint)
					}
					
					break
				}
			}
		}
		
		// Assign joints.
		for (let component of this.components)
		{
			if (component.isVoltageSource)
				component.voltageSourceIndex = (this.voltageSources++)
			
			for (let i = 0; i < component.points.length; i++)
			{
				const key = jointKey(component.points[i])
				
				let joint = this.joints.get(key)
				if (!joint)
				{
					joint = { jointIndex: this.joints.size, nodeIndex: -1, pos: component.points[i], outgoingDirections: [], labelDirection: 0, visible: true }
					this.joints.set(key, joint)
				}
				
				joint.outgoingDirections.push(component.getOutgoingDirectionFromNode(i))
			}
		}
		
		// Assign nodes to joints.
		for (let component of this.components)
		{
			for (let i = 0; i < component.points.length; i++)
			{
				const isNode = !(i == 1 && component instanceof ComponentSingleEnded)
				
				const key = jointKey(component.points[i])
				
				let joint = this.joints.get(key)
				if (isNode && joint.nodeIndex < 0)
				{
					joint.nodeIndex = this.nodes.length
					this.nodes.push({})
				}
				
				component.nodes[i] = joint.nodeIndex
				component.joints[i] = joint.jointIndex
			}
		}
		
		// Find voltage label position for joints.
		for (let [key, joint] of this.joints)
		{
			if (joint.outgoingDirections.length == 1)
				joint.labelDirection = joint.outgoingDirections[0] + Math.PI
			
			else
			{
				joint.outgoingDirections.sort((a, b) => a - b)
				
				let biggestGapSize = 0
				for (let i = 0; i < joint.outgoingDirections.length; i++)
				{
					const iNext = (i + 1) % joint.outgoingDirections.length
					
					const curDir  = joint.outgoingDirections[i]
					const nextDir = joint.outgoingDirections[iNext]
					
					const wrapAround = (nextDir < curDir ? Math.PI * 2 : 0)
					const gapSize = (wrapAround * 2 + nextDir) - (wrapAround + curDir)
					
					if (gapSize > biggestGapSize)
					{
						biggestGapSize = gapSize
						joint.labelDirection = curDir + gapSize / 2
					}
				}
			}
		}
		
		this.refreshSolver()
	}
	
	
	refreshSolver()
	{
		this.time = 0
		
		for (const component of this.components)
			component.reset(this)
		
		this.solver.stampBegin(this.nodes.length, this.voltageSources, this.groundNodeIndex)
		
		for (const component of this.components)
			component.solverBegin(this, this.solver)
		
		this.solver.stampEnd()
	}
	
	
	getVoltageSourceCurrent(voltageSourceIndex)
	{
		return this.solver.getVoltageSourceCurrent(voltageSourceIndex)
	}
	
	
	getNodeVoltage(nodeIndex)
	{
		return this.solver.getNodeVoltage(nodeIndex)
	}
	
	
	getVoltageColor(voltage)
	{
		const gray = 160
		
		if (!voltage)
			return "rgb(" + gray + "," + gray + "," + gray + ")"
		
		if (voltage > 0)
		{
			const factor = Math.min(1, voltage / 10)
			const cGreen = Math.floor(gray + factor * (255 - gray))
			const cOther = Math.floor(gray - factor * gray)
			return "rgb(" + cOther + "," + cGreen + "," + cOther + ")"
		}
		else
		{
			const factor = Math.min(1, -voltage / 10)
			const cRed   = Math.floor(gray + factor * (255 - gray))
			const cOther = Math.floor(gray - factor * gray)
			return "rgb(" + cRed + "," + cOther + "," + cOther + ")"
		}
	}
	
	
	render()
	{
		if (this.debugDrawClean)
			this.ctx.clearRect(0, 0, this.width, this.height)
		else
		{
			this.ctx.fillStyle = "#000022"
			this.ctx.fillRect(0, 0, this.width, this.height)
		}
		
		if (this.components.length == 0)
		{
			this.ctx.font = "15px Verdana"
			this.ctx.textAlign = "center"
			this.ctx.textBaseline = "middle"
			this.ctx.fillStyle = "#aac"
			this.ctx.fillText("Select a tool and draw here!", this.width / 2, this.height / 2)
		}
		
		this.ctx.fillStyle = "#aac"
		this.ctx.font = "15px Verdana"
		this.ctx.textAlign = "left"
		this.ctx.textBaseline = "top"
		this.ctx.fillText("t = " + this.time.toFixed(3) + " s", 10, 10)
		
		this.ctx.lineWidth = 4
		this.ctx.lineCap = "round"
		
		this.ctx.strokeStyle = "#26a"
		this.ctx.fillStyle = "#26a"
		for (const component of this.components)
			component.renderSelection(this, this.ctx)
		
		this.ctx.strokeStyle = "#4af"
		this.ctx.fillStyle = "#4af"
		if (this.mouseCurrentHoverComponent != null && !this.mouseDown)
			this.mouseCurrentHoverComponent.renderHover(this, this.ctx, this.mouseCurrentHoverData)
		
		this.ctx.strokeStyle = "#f80"
		this.ctx.fillStyle = "#f80"
		for (const component of this.componentsForEditing)
			component.renderEditing(this, this.ctx)
		
		for (const component of this.components)
			component.render(this, this.ctx)
		
		if (!this.mouseDown)
			for (const component of this.components)
				component.renderCurrent(this, this.ctx)
		
		this.drawNodeVoltages()
		//this.drawDebugNodes()
		
		if (!this.mouseDown && this.mousePos != null && this.mouseAddComponentClass != null)
		{
			this.ctx.strokeStyle = "#eeeeee"
			this.ctx.beginPath()
			this.ctx.arc(this.mousePos.x, this.mousePos.y, 3, 0, Math.PI * 2)
			this.ctx.stroke()
		}
	}
	
	
	drawDebugNodes()
	{
		this.ctx.font = "15px Verdana"
		for (const component of this.components)
			for (let i = 0; i < component.points.length; i++)
			{
				this.ctx.fillStyle = (component.nodes[i] == this.groundNodeIndex ? "#888888" : "#ffffff")
				this.ctx.fillText(component.nodes[i].toString(), component.points[i].x - 15, component.points[i].y - 15)
			}
		
		this.ctx.fillStyle = "#00ff00"
		for (const component of this.components)
			if (component.isVoltageSource)
				this.ctx.fillText(component.voltageSourceIndex.toString(), component.points[1].x + 15, component.points[1].y - 15)
	}
	
	
	drawNodeVoltages()
	{
		this.ctx.font = "15px Verdana"
		this.ctx.textBaseline = "middle"
		
		for (const [key, joint] of this.joints)
		{
			if (!joint.visible)
				continue
			
			const xOffset = 15 *  Math.cos(joint.labelDirection)
			const yOffset = 15 * -Math.sin(joint.labelDirection)
			
			if (Math.abs(xOffset) < Math.abs(yOffset) * 0.1)
				this.ctx.textAlign = "center"
			else if (xOffset > 0)
				this.ctx.textAlign = "left"
			else
				this.ctx.textAlign = "right"
			
			const v = this.getNodeVoltage(joint.nodeIndex)
			const str = v.toFixed(3) + " V"
			
			this.ctx.fillStyle = this.getVoltageColor(v)
			this.ctx.fillText(str, joint.pos.x + xOffset, joint.pos.y + yOffset)
		}
	}
	
	
	saveToString()
	{
		let str = "0,"
		str += this.joints.size + ","
		
		for (const [key, joint] of this.joints)
		{
			str += (joint.pos.x / this.tileSize).toString() + ","
			str += (joint.pos.y / this.tileSize).toString() + ","
		}
		
		for (const component of this.components)
		{
			str += component.constructor.getSaveId() + ","
			str += component.saveToString(this)
		}
		
		return str
	}
	
	
	loadFromString(str)
	{
		let strParts = str.split(",")
		
		let reader =
		{
			index: 0,
			isOver() { return this.index >= strParts.length },
			read() { return strParts[this.index++] }
		}
		
		let loadData = 
		{
			joints: []
		}
		
		const version = parseInt(reader.read())
		const jointNum = parseInt(reader.read())
		
		for (let i = 0; i < jointNum; i++)
		{
			const x = parseInt(reader.read()) * this.tileSize
			const y = parseInt(reader.read()) * this.tileSize
			loadData.joints.push({ x, y })
		}
		
		const componentClasses =
		[
			ComponentWire,
			ComponentBattery,
			ComponentResistor,
			ComponentCurrentSource,
			ComponentCapacitor,
			ComponentInductor,
			ComponentVoltageSource,
			ComponentGround,
		]
		
		let componentIds = new Map()
		for (const c of componentClasses)
			componentIds.set(c.getSaveId(), c)
		
		while (!reader.isOver())
		{
			const id = reader.read()
			if (id == null || id == "")
				break
			
			const componentClass = componentIds.get(id)
			const component = new componentClass({ x: 0, y: 0 })
			component.loadFromString(this, loadData, reader)
			
			this.components.push(component)
		}
		
		this.removeDegenerateComponents()
		this.refreshNodes()
		this.render()
	}
}