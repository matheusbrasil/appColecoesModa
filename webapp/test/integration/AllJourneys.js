/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"ovly/moda/appcolecao/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"ovly/moda/appcolecao/test/integration/pages/Worklist",
	"ovly/moda/appcolecao/test/integration/pages/Object",
	"ovly/moda/appcolecao/test/integration/pages/NotFound",
	"ovly/moda/appcolecao/test/integration/pages/Browser",
	"ovly/moda/appcolecao/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "ovly.moda.appcolecao.view."
	});

	sap.ui.require([
		"ovly/moda/appcolecao/test/integration/WorklistJourney",
		"ovly/moda/appcolecao/test/integration/ObjectJourney",
		"ovly/moda/appcolecao/test/integration/NavigationJourney",
		"ovly/moda/appcolecao/test/integration/NotFoundJourney",
		"ovly/moda/appcolecao/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});