sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "restart";
	const pathData = "M16 256l50-96 46 96H80q0 40 15 75t41 61.5 61 41.5 75 15 75-15 61-41 41-61 15-75-15-75-41-61-61-41-75-15V33q47 0 87.5 17.5t71 48 48 71T496 257q0 46-17.5 87t-48 71.5-71 48T272 481q-46 0-87-17.5T113.5 415t-48-72T48 256H16zm180-80q0-7 4.5-11.5T211 160l2 1q5 0 6 1l161 83q8 5 8 13.5t-8 13.5l-161 78q-2 0-3 .5t-3 .5q-1 1-2 1-6 0-10.5-4t-4.5-11V176z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV5 = { pathData };

	return pathDataV5;

});
