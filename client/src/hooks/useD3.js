import React from "react";
import * as d3 from "d3";


/* Thanks to Benney Au for this function: https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app */
export const useD3 = (renderFn, dependencies) => {
	const ref = React.useRef();

	React.useEffect(() => {
		renderFn(d3.select(ref.current));
		return () => {};
	}, dependencies);
	return ref;
};