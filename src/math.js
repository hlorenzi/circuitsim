const multiplierPrefixes = ["k", "M", "G", "T", "P", "E", "Z", "Y"]
const dividerPrefixes    = ["m", "u", "n", "p", "f", "a", "z", "y"]


export function valueToStringWithUnitPrefix(x, separator = "")
{
	if (x == 0)
		return x.toString()
	
	const sign = (x > 0 ? 1 : -1)
	let xAbs = Math.abs(x)
	
	if (xAbs >= 1000)
	{
		let prefixIndex = -1
		while (xAbs >= 1000 && prefixIndex + 1 < multiplierPrefixes.length)
		{
			xAbs /= 1000
			prefixIndex += 1
		}
		
		xAbs = Math.round(xAbs * 1000) / 1000
		
		return (xAbs * sign).toString() + separator + multiplierPrefixes[prefixIndex]
	}
	
	else if (xAbs < 1)
	{
		let prefixIndex = -1
		while (xAbs < 1 && prefixIndex + 1 < dividerPrefixes.length)
		{
			xAbs *= 1000
			prefixIndex += 1
		}
		
		xAbs = Math.round(xAbs * 1000) / 1000
		
		return (xAbs * sign).toString() + separator + dividerPrefixes[prefixIndex]
	}
	
	else
		return x.toString() + separator
}


export function stringWithUnitPrefixToValue(str)
{
	str = str.trim()
	
	for (let i = 0; i < multiplierPrefixes.length; i++)
	{
		if (str.endsWith(multiplierPrefixes[i]))
			return parseFloat(str.substr(0, str.length - 1)) * Math.pow(1000, i + 1)
	}
	
	for (let i = 0; i < dividerPrefixes.length; i++)
	{
		if (str.endsWith(dividerPrefixes[i]))
			return parseFloat(str.substr(0, str.length - 1)) * Math.pow(1000, -i - 1)
	}
	
	return parseFloat(str)
}