sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "multi-select";
	const pathData = "M64 416v64h64v-64H64zm-32 96V384h128v128H32zm60-229l80-96 20 19L92 323l-60-59 20-19zm372-27q16 0 16 16t-16 16H273q-6 0-11-5t-5-11q0-16 16-16h191zm0 192q16 0 16 16t-16 16H273q-6 0-11-5t-5-11q0-16 16-16h191zM92 97l80-97 20 19L92 137 32 78l20-21zm372-32q16 0 16 16t-16 16H273q-6 0-11-5t-5-11q0-16 16-16h191z";
	const ltr = true;
	const accData = i18nDefaults.ICON_MULTI_SELECT;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV5 = { pathData, accData };

	return pathDataV5;

});
