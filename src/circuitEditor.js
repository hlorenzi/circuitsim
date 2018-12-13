import { CircuitSolver } from "./circuitSolver.js"


export class CircuitEditor
{
	constructor(canvas)
	{
		this.canvas = canvas
		this.ctx = canvas.getContext("2d")
		this.width = parseInt(canvas.width)
		this.height = parseInt(canvas.height)
		
		this.tileSize = 25
		
		this.components = []
		
		this.solver = new CircuitSolver()
		this.nodes = new Map()
		this.groundNodeIndex = -1
		this.voltageSources = 0
		
		this.mouseDown = false
		this.mousePos = null
		this.mouseDragOrigin = null
		this.mouseAddComponentClass = null
		this.mouseCurrentAction = null
		this.mouseCurrentHoverComponent = null
		this.mouseCurrentHoverData = null
		
		this.canvas.onmousedown = (ev) => this.onMouseDown(ev)
		this.canvas.onmousemove = (ev) => this.onMouseMove(ev)
		this.canvas.onmouseup   = (ev) => this.onMouseUp  (ev)
		
		window.onkeydown = (ev) => this.onKeyDown(ev)
	}
	
	
	run()
	{
		this.draw()
		window.requestAnimationFrame(() => this.run())
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
		if (this.mouseDown)
			return
		
		const pos = this.snapPos(this.getMousePos(ev))
		
		this.mouseDragOrigin = pos
		
		this.mouseDown = true
		
		if (!ev.ctrlKey)// && (this.mouseCurrentHoverComponent == null || !this.mouseCurrentHoverComponent.isAnySelected()))
			this.unselectAll()
		
		if (this.mouseAddComponentClass != null)
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
	}
	
	
	onMouseMove(ev)
	{
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
		
		this.refreshNodes()
	}
	
	
	onMouseUp(ev)
	{
		if (!this.mouseDown)
			return
		
		this.mouseDown = false
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
	
	
	refreshNodes()
	{
		this.nodes = new Map()
		this.groundNodeIndex = -1
		this.voltageSources = 0
		
		for (let component of this.components)
		{
			if (component.isVoltageSource)
				component.voltageSourceIndex = (this.voltageSources++)
				
			for (let i = 0; i < component.points.length; i++)
			{
				const key = component.points[i].x / this.tileSize * 1000 + component.points[i].y / this.tileSize
				
				let node = this.nodes.get(key)
				if (!node)
				{
					node = { index: this.nodes.size, pos: component.points[i] }
					this.nodes.set(key, node)
				}
				
				component.nodes[i] = node.index
			}
				
			if (this.groundNodeIndex == -1 && component.isVoltageSource && component.voltage)
				this.groundNodeIndex = component.nodes[0]
		}
		
		if (this.groundNodeIndex == -1)
		{
			this.groundNodeIndex = this.nodes.size
			this.nodes.set(0, { index: this.nodes.size, pos: { x: -1, y: -1 }})
		}
		
		this.refreshSolver()
	}
	
	
	refreshSolver()
	{
		this.solver.stampBegin(this.nodes.size, this.voltageSources, this.groundNodeIndex)
		
		for (const component of this.components)
			component.stamp(this.solver)
		
		this.solver.stampEnd()
		this.solver.solve()
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
		if (!voltage)
			return "#fff"
		else if (voltage > 0)
		{
			const factor = Math.min(1, voltage / 10)
			const c = Math.floor(255 - factor * 255)
			return "rgb(" + c + ",255," + c + ")"
		}
		else
		{
			const factor = Math.min(1, -voltage / 10)
			const c = Math.floor(255 - factor * 255)
			return "rgb(255," + c + "," + c + ")"
		}
	}
	
	
	draw()
	{
		this.ctx.fillStyle = "#000022"
		this.ctx.fillRect(0, 0, this.width, this.height)
		
		this.ctx.lineWidth = 4
		this.ctx.lineCap = "round"
		
		for (const component of this.components)
			component.drawSelection(this, this.ctx)
		
		if (this.mouseCurrentHoverComponent != null)
			this.mouseCurrentHoverComponent.drawHover(this, this.ctx, this.mouseCurrentHoverData)
		
		for (const component of this.components)
		{
			component.step(this)
			component.draw(this, this.ctx)
		}
		
		for (const component of this.components)
			component.drawCurrent(this, this.ctx)
		
		this.drawDebugVoltages()
		
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
	
	
	drawDebugVoltages()
	{
		this.ctx.fillStyle = "#00ff00"
		this.ctx.font = "15px Verdana"
		for (const component of this.components)
			for (let i = 0; i < component.points.length; i++)
				this.ctx.fillText(this.getNodeVoltage(component.nodes[i]).toFixed(3), component.points[i].x - 15, component.points[i].y - 15)
	}
}