import React from "react"
import { ComponentWire } from "./componentWire.js"
import * as MathUtils from "./math.js"


function EditBoxContents(props)
{
	let elems = []
	
	const [state, setState] = React.useState({})
	
	React.useEffect(() => setState({}), [props.componentToEdit])
	
	const editBoxDef =
	{
		addNumberUnitInput: (valueLabel, unitLabel, value, setValue) =>
		{
			const key = elems.length.toString()
			const str = state[key] === undefined ? MathUtils.valueToStringWithUnitPrefix(value) : state[key]
			const setStr = (x) => setState({ ...state, [key]: x })
			
			const onChange = (ev) =>
			{
				setStr(ev.target.value)
				
				const val = MathUtils.stringWithUnitPrefixToValue(ev.target.value)
				if (isNaN(val) || !isFinite(val))
					return
				
				setValue(val)
				props.onChange()
			}
			
			elems.push(
				<div key={ elems.length } style={{ marginBottom: "0.5em" }}>
				
					<div style={{
						display: "inline-block",
						marginRight: "0.5em",
						color: "#89a",
						textAlign: "right",
						width: "8em",
					}}>
						{ valueLabel }
					</div>
					
					<input
						value={ str }
						onChange={ onChange }
						onKeyDown={ (ev) => ev.stopPropagation() }
						onFocus={ (ev) => ev.target.setSelectionRange(0, ev.target.value.length) }
						style={{
							width: "3em",
							padding: "0.5em",
							textAlign: "right",
							backgroundColor: "#234",
							color: "#def",
							border: "1px solid #668",
							borderRadius: "0.25em",
					}}/>
					
					<span style={{ marginLeft: "0.25em" }}>{ unitLabel }</span>
				
				</div>
			)
		}
	}
	
	props.componentToEdit.getEditBox(editBoxDef)
	
	return <div>
		{ elems }
	</div>
}


export function UIEditBox(props)
{
	if (props.editor.componentsForEditing.length != 1)
		return null
	
	const componentToEdit = props.editor.componentsForEditing[0]
	const componentBBox = componentToEdit.getBBox()
	
	const absolutePos = props.editor.getAbsolutePosition({ x: componentBBox.xMax + 10, y: (componentBBox.yMin + componentBBox.yMax) / 2 })
	
	return (
	
		<div style={{
			position: "absolute",
			left: absolutePos.x + "px",
			top: absolutePos.y + "px",
			height: "0",
		}}>
			<div style={{
				position: "relative",
				whiteSpace: "nowrap",
				top: "50%",
				transform: "translate(0, -50%)",
				backgroundColor: "#223",
				color: "#def",
				border: "2px solid #668",
				borderRadius: "0.5em",
				margin: "0.5em",
				padding: "0.5em",
			}}>
		
				<div style={{ fontWeight: "bold" }}>{ componentToEdit.constructor.getName() }</div>
				<div style={{ width: "100%", marginTop: "0.5em", marginBottom: "0.5em", borderBottom: "1px solid #668" }}/>
				
				<EditBoxContents componentToEdit={ componentToEdit } onChange={ props.onChange }/>
			
			</div>
		</div>
	
	)
}