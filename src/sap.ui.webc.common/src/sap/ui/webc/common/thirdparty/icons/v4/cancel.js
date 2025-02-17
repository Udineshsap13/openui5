sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "cancel";
	const pathData = "M256 0q53 0 99.5 20T437 74.5t55 81.5 20 100-20 99.5-55 81.5-81.5 55-99.5 20-99.5-20T75 437t-55-81.5T0 256t20-100 55-81.5T156.5 20 256 0zm0 480q38 0 72.5-12.5T392 434L78 120q-22 29-34 63.5T32 256q0 46 17.5 87t48 71.5 71.5 48 87 17.5zm180-92q21-28 32.5-61.5T480 256q0-46-17.5-87t-48-71.5-71.5-48T256 32q-37 0-70.5 11.5T124 75z";
	const ltr = true;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV5 = { pathData };

	return pathDataV5;

});
