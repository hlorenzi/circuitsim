import { ComponentLine } from "./componentLine.js"


export class ComponentVoltageSource extends ComponentLine
{
	constructor(pos)
	{
		super(pos)
		
		this.voltage = 5
		this.isVoltageSource = true
		
		this.dcBias = 0
		this.frequency = 60
		this.amplitude = 5
		this.phaseOffset = 0
	}
	
	
	static getSaveId()
	{
		return "vs"
	}
	
	
	static getName()
	{
		return "Voltage Source"
	}
	
	
	saveToString(manager)
	{
		return this.nodes[0] + "," + this.nodes[1] + ",0," +
			this.dcBias + "," +
			this.frequency + "," +
			this.amplitude + "," +
			this.phaseOffset + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		const version = parseInt(reader.read())
		this.dcBias = parseFloat(reader.read())
		this.frequency = parseFloat(reader.read())
		this.amplitude = parseFloat(reader.read())
		this.phaseOffset = parseFloat(reader.read())
	}
	
	
	step(manager)
	{
		this.current = manager.getVoltageSourceCurrent(this.voltageSourceIndex)
		super.step(manager)
	}
	
	
	calculateVoltage(manager)
	{
		return this.dcBias + Math.sin((manager.time * Math.PI * 2 + this.phaseOffset) * this.frequency) * this.amplitude
	}
	
	
	stamp(manager, solver)
	{
		solver.stampVoltage(this.voltageSourceIndex, this.nodes[0], this.nodes[1], this.calculateVoltage(manager))
	}
	
	
	solverIteration(manager, solver)
	{
		solver.stampVoltage(this.voltageSourceIndex, this.nodes[0], this.nodes[1], this.calculateVoltage(manager))
	}
	
	
	getEditBox(editBoxDef)
	{
		editBoxDef.addNumberUnitInput("Amplitude",    "V",   this.amplitude,   (x) => { this.amplitude = x })
		editBoxDef.addNumberUnitInput("DC Bias",      "V",   this.dcBias,      (x) => { this.dcBias = x })
		editBoxDef.addNumberUnitInput("Frequency",    "Hz",  this.frequency,   (x) => { this.frequency = x })
		editBoxDef.addNumberUnitInput("Phase Offset", "rad", this.phaseOffset, (x) => { this.phaseOffset = x })
	}
	
	
	draw(manager, ctx)
	{
		const symbolSize = Math.min(50, this.getLength())
	
		const centerX = (this.points[0].x + this.points[1].x) / 2
		const centerY = (this.points[0].y + this.points[1].y) / 2
		
		this.drawSymbolBegin(manager, ctx, symbolSize)
		this.drawSymbolEnd(manager, ctx)
		
		ctx.save()
		ctx.translate(centerX, centerY)
		
		ctx.strokeStyle = manager.getVoltageColor(manager.getNodeVoltage(this.nodes[1]))
		
		ctx.beginPath()
		ctx.arc(0, 0, symbolSize / 2, 0, Math.PI * 2)
		ctx.stroke()
		
		ctx.beginPath()
		ctx.moveTo          (-symbolSize * 0.3, 0)
		ctx.quadraticCurveTo(-symbolSize * 0.15, -symbolSize * 0.3, 0, 0)
		ctx.quadraticCurveTo( symbolSize * 0.15,  symbolSize * 0.3,  symbolSize * 0.3, 0)
		ctx.stroke()
		
		ctx.restore()
	}
}