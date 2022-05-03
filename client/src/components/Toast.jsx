export function Toast(props)
{
	const type = " " + props.type || "";

	return (
		<div className={"toast"+type}>
			{props.children}
		</div>
	);
}