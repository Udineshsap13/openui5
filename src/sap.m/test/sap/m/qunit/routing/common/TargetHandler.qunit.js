/*global QUnit, sinon */
sap.ui.define([
	"sap/m/routing/TargetHandler",
	"sap/m/NavContainer",
	"sap/m/SplitContainer",
	"sap/m/Page",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"sap/m/InstanceManager",
	"sap/ui/core/library"
], function(
	TargetHandler,
	NavContainer,
	SplitContainer,
	Page,
	History,
	Device,
	InstanceManager,
	library
) {
	"use strict";

	// shortcut for sap.ui.core.routing.HistoryDirection
	var HistoryDirection = library.routing.HistoryDirection;

	QUnit.module("add and execute navigations", {
		beforeEach: function () {
			this.oTargets = new TargetHandler();
		},
		afterEach: function () {
			this.oTargets.destroy();
		}
	});

	QUnit.test("Should do a forward navigation", function (assert) {
		//Arrange
		var oStartPage = new Page(),
			oToPage = new Page(),
			oNavContainer = new NavContainer({
				pages: [
					oStartPage
				]
			}),
			oNavigationParameters = {
				targetControl: oNavContainer,
				view: oToPage,
				transition: "flip",
				transitionParameters: { some: "parameter"},
				eventData: { some: "data"}
			},
			oToSpy = this.spy(oNavContainer, "to");

		//Act + SUT
		this.oTargets.addNavigation(oNavigationParameters);
		this.oTargets.navigate({
			direction: HistoryDirection.Forwards
		});

		//Assert
		assert.strictEqual(oToSpy.callCount, 1, "did call the 'to' function on the oNavContainer instance");
		sinon.assert.calledWithExactly(oToSpy, oToPage.getId(), oNavigationParameters.transition, oNavigationParameters.eventData, oNavigationParameters.transitionParameters);

		// Cleanup
		oNavContainer.destroy();
	});

	QUnit.test("Should do a backwards navigation", function (assert) {
		//Arrange
		var oStartPage = new Page(),
			oToPage = new Page(),
			oNavContainer = new NavContainer({
				pages: [
					oStartPage
				]
			}),
			oNavigationParameters = {
				targetControl: oNavContainer,
				view: oToPage,
				transition: "flip",
				transitionParameters: { some: "parameter"},
				eventData: { some: "data"}
			},
			oBackSpy = this.spy(oNavContainer, "backToPage"),
			oInsertSpy = this.spy(oNavContainer, "insertPreviousPage");

		//Act + SUT
		this.oTargets.addNavigation(oNavigationParameters);
		this.oTargets.navigate({
			direction: HistoryDirection.Backwards
		});

		//Assert
		assert.strictEqual(oBackSpy.callCount, 1, "did call the 'backToPage' function on the oNavContainer instance");
		assert.strictEqual(oInsertSpy.callCount, 1, "did call the 'insertPreviousPage' function on the oNavContainer instance");
		sinon.assert.calledWithExactly(oBackSpy, oToPage.getId(), oNavigationParameters.eventData, oNavigationParameters.transitionParameters);
		sinon.assert.calledWithExactly(oInsertSpy, oToPage.getId(), oNavigationParameters.transition, oNavigationParameters.eventData);

		// Cleanup
		oNavContainer.destroy();
	});

	QUnit.test("Should not navigate if the currentPage is already displayed", function (assert) {
		//Arrange
		var oPage = new Page(),
			oNavContainer = new NavContainer({
				pages: [
					oPage
				]
			}),
			oNavigationParameters = {
				targetControl: oNavContainer,
				eventData: {some: "data"},
				view: oPage
			},
			oToSpy = this.spy(NavContainer.prototype, "to"),
			oNavigateSpy = this.spy(TargetHandler.prototype, "navigate");

		// stub the getDomRef to make the NavContainer pretend to be rendered
		this.stub(oNavContainer, "getDomRef").callsFake(function() {
			return document.createElement("div");
		});

		//Act
		this.oTargets.addNavigation(oNavigationParameters);
		this.oTargets.navigate({
			direction: HistoryDirection.forwards
		});

		//Assert
		assert.strictEqual(oToSpy.callCount, 0, "did not call the 'to' function on the oNavContainer instance");
		assert.strictEqual(oNavigateSpy.callCount, 1, "did call _handleRouteMatched");
	});

	QUnit.test("Should do a forward navigation in master and detail of a splitContainer", function (assert) {
		//Arrange
		var oMasterStartPage = new Page(),
			oDetailStartPage = new Page(),
			oMasterToPage = new Page(),
			oDetailToPage = new Page(),
			oSplitContainer = new SplitContainer({
				masterPages: [
					oMasterStartPage,
					oMasterToPage
				],
				detailPages: [
					oDetailStartPage,
					oDetailToPage
				]
			}),
			oNavigationParameters = {
				targetControl: oSplitContainer,
				transition: "flip",
				transitionParameters: { some: "parameter"},
				eventData: { some: "data"}
			},
			oToSpy = this.spy(oSplitContainer, "to");

		//System under Test
		var oTargetHandler = new TargetHandler();

		//Act
		oTargetHandler.addNavigation(jQuery.extend({ view : oMasterToPage, aggregationName : "masterPages" }, oNavigationParameters));
		oTargetHandler.addNavigation(jQuery.extend({ view : oDetailToPage, aggregationName : "detailPages" }, oNavigationParameters));

		oTargetHandler.navigate({
			direction: HistoryDirection.Forwards
		});

		//Assert
		assert.strictEqual(oToSpy.callCount, 2, "did call the 'to' function twice");

		sinon.assert.calledWithExactly(oToSpy, oMasterToPage.getId(), oNavigationParameters.transition, oNavigationParameters.eventData, oNavigationParameters.transitionParameters);
		sinon.assert.calledWithExactly(oToSpy, oDetailToPage.getId(), oNavigationParameters.transition, oNavigationParameters.eventData, oNavigationParameters.transitionParameters);
	});

	//test function for test cases
	function oneNavigationTest(assert, fnContainer) {
		//Arrange
		var oContainer = new fnContainer(),
			oPage1 = new Page(),
			oPage2 = new Page(),
			fnApplyNavigationResultSpy = this.stub(TargetHandler.prototype, "_applyNavigationResult");

		//System under Test
		var oTargets = new TargetHandler();

		//Act
		oTargets.addNavigation({
			targetControl: oContainer,
			eventData: {},
			view: oPage1
		});
		oTargets.addNavigation({
			targetControl: oContainer,
			eventData: {},
			view: oPage2
		});
		oTargets.navigate({
			direction: HistoryDirection.forwards
		});

		//Assert
		assert.strictEqual(fnApplyNavigationResultSpy.callCount, 1, "did invoke the 'to' function on the container");
		var oCall = fnApplyNavigationResultSpy.getCall(0);

		assert.strictEqual(oCall.args[0].view.getId(), oPage2.getId(), "did invoke it with the second page");

		oTargets.destroy();
	}

	QUnit.test("Should create one Navigation for a navContainer", function (assert) {
		oneNavigationTest.call(this, assert, NavContainer);
	});

	QUnit.test("Should create one Navigation for a splitContainer in phone mode", function (assert) {
		this.stub(Device.system, "phone").value(true);
		oneNavigationTest.call(this, assert, SplitContainer);
	});

	//this tests a bug that a queue was not emptied before
	QUnit.test("Should empty previous navigations", function (assert) {
		//Arrange
		var fnAppyNavigationResultSpy = this.stub(TargetHandler.prototype, "_applyNavigationResult"),
			oNavContainer = new NavContainer(),
			oPage = new Page(),
			//System under Test
			oTargets = new TargetHandler();

		oTargets.addNavigation({
			eventData: {},
			view: oPage,
			targetControl: oNavContainer
		});

		oTargets.navigate({
			direction: HistoryDirection.forwards
		});

		assert.strictEqual(fnAppyNavigationResultSpy.callCount, 1, "did invoke handleRouteMatched");

		//Act - fire the event again
		oTargets.navigate({
			direction: HistoryDirection.forwards
		});

		//Assert
		assert.strictEqual(fnAppyNavigationResultSpy.callCount, 1, "did invoke handleRouteMatched only once");
		var oCall = fnAppyNavigationResultSpy.getCall(0);

		assert.strictEqual(oCall.args[0].view.getId(), oPage.getId(), "did invoke it with the first view");

		oTargets.destroy();
	});

	QUnit.module("Dialog closing", {
		beforeEach: function () {
			this.oStartPage = new Page();
			this.oNavContainer = new NavContainer({
				pages: [
					this.oStartPage
				]
			});
			this.oStub = sinon.stub(this.oNavContainer, "getDomRef").callsFake(function() {
				return document.createElement("div");
			});
			this.oTargetHandler = new TargetHandler();
		},
		afterEach: function () {
			this.oNavContainer.destroy();
			this.oTargetHandler.destroy();
			this.oStub.restore();
		}
	});

	QUnit.test("Should close all dialogs", function (assert) {
		// Arrange
		var oCloseAllPopoversSpy = this.spy(InstanceManager, "closeAllPopovers"),
			oCloseAllDialogsSpy = this.spy(InstanceManager, "closeAllDialogs"),
			oTargetPage = new Page();

		this.stub(InstanceManager, "hasOpenPopover").returns(true);
		this.stub(InstanceManager, "hasOpenDialog").returns(true);

		// Act
		this.oTargetHandler.addNavigation({
			view: oTargetPage,
			targetControl: this.oNavContainer
		});
		this.oTargetHandler.navigate({});

		// Assert
		assert.strictEqual(oCloseAllPopoversSpy.callCount, 1, "did close the popups");
		assert.strictEqual(oCloseAllDialogsSpy.callCount, 1, "did close the dialogs");

		// Cleanup
		oTargetPage.destroy();
	});

	QUnit.test("Should not close dialogs, if the current page is already displayed", function (assert) {
		// System under test
		var fnCloseSpy = this.spy(this.oTargetHandler, "_closeDialogs");

		// Act
		this.oTargetHandler.addNavigation({
			view: this.oStartPage,
			targetControl: this.oNavContainer
		});
		this.oTargetHandler.navigate({});


		// Assert
		assert.strictEqual(fnCloseSpy.callCount, 0, "did not close the dialogs");
	});

	QUnit.test("Should set close all dialogs", function (assert) {
		//Assert
		assert.ok(this.oTargetHandler.getCloseDialogs(), "default value is true");

		//Act
		this.oTargetHandler.setCloseDialogs(false);

		//Assert
		assert.ok(!this.oTargetHandler.getCloseDialogs(), "should return false after set to false");
	});


	QUnit.module("Direction determinator",{
		beforeEach: function () {
			this.oTargetHandler = new TargetHandler();
		},
		afterEach: function () {
			this.oTargetHandler.destroy();
		}
	});

	QUnit.test("Should take the direction if it is passed directly", function (assert) {

		function directDirectionTestcase (sDirection, bExprectedBackwards) {
			// Act
			var bResult = this.oTargetHandler._getDirection({
				direction: sDirection
			});

			// Assert
			assert.strictEqual(bResult, bExprectedBackwards, "Did return the expected direction");
		}

		directDirectionTestcase.call(this, HistoryDirection.Backwards, true);
		directDirectionTestcase.call(this, HistoryDirection.Forwards, false);
		directDirectionTestcase.call(this, undefined, false);
	});

	function viewLevelDirectionTestcase(assert, oTestOptions) {
		// Arrange
		this.oTargetHandler._iCurrentLevel = oTestOptions.currentLevel;

		// Act
		var bResult = this.oTargetHandler._getDirection({
			level: oTestOptions.newViewLevel
		});

		// Assert
		assert.strictEqual(bResult, oTestOptions.expectedBackwards, "Did return the expected direction");
	}

	QUnit.test("Should be backwards if the new viewlevel is lower than the current one", function (assert) {

		viewLevelDirectionTestcase.call(this, assert, {
			currentLevel : 1,
			newViewLevel : 0,
			expectedBackwards : true
		});

	});

	QUnit.test("Should be forwards if the new viewlevel is greater than the current one", function (assert) {

		viewLevelDirectionTestcase.call(this, assert, {
			currentLevel : 0,
			newViewLevel : 1,
			expectedBackwards : false
		});

	});

	QUnit.test("Should be forwards if the new viewlevel is equal to the current one", function (assert) {

		viewLevelDirectionTestcase.call(this, assert, {
			currentLevel : 0,
			newViewLevel : 0,
			expectedBackwards : false
		});

	});

	QUnit.test("Should be forwards if the new viewlevel is undefined and the last one is not undefined", function (assert) {


		viewLevelDirectionTestcase.call(this, assert, {
			currentLevel : 0,
			newViewLevel : undefined,
			expectedBackwards : false
		});

	});

	QUnit.test("Should be forwards if the new viewlevel is defined but the last one is undefined", function (assert) {

		viewLevelDirectionTestcase.call(this, assert, {
			currentLevel : undefined,
			newViewLevel : 0,
			expectedBackwards : false
		});

	});

	QUnit.test("Should be forwards if both are undefined", function (assert) {

		viewLevelDirectionTestcase.call(this, assert, {
			currentLevel : undefined,
			newViewLevel : undefined,
			expectedBackwards : false
		});

	});

	function historyDirectionTestcase (assert, oTestOptions) {
		// Arrange
		var oStub = this.stub(History.prototype, "getDirection").returns(oTestOptions.historyDirection);

		// Act
		var bResult = this.oTargetHandler._getDirection({
			askHistory: true
		});

		// Assert
		assert.strictEqual(bResult, oTestOptions.expectedBackwards, "Did return the expected direction");
		assert.strictEqual(oStub.callCount, 1, "Did ask the history");
	}

	QUnit.test("Should be forwards if history direction is not backwards", function (assert) {

		historyDirectionTestcase.call(this, assert, {
			historyDirection :HistoryDirection.Forwards,
			expectedBackwards : false
		});

	});

	QUnit.test("Should be forwards if history direction is unknown", function (assert) {

		historyDirectionTestcase.call(this, assert, {
			historyDirection : HistoryDirection.Unknown,
			expectedBackwards : false
		});

	});

	QUnit.test("Should be backwards if history direction is backwards", function (assert) {

		historyDirectionTestcase.call(this, assert, {
			historyDirection : HistoryDirection.Backwards,
			expectedBackwards : true
		});

	});

	QUnit.test("Should not ask viewLevel or history if direction is given", function (assert) {

		// Arrange
		this.oTargetHandler._iCurrentLevel = 0;
		var oStub = this.stub(History.prototype, "getDirection").returns(HistoryDirection.Forwards);

		// Act
		var bBackwards = this.oTargetHandler._getDirection({
			askHistory: true,
			direction: HistoryDirection.Backwards,
			level: 1
		});

		// Assert
		assert.strictEqual(bBackwards, true, "Did return the backwards direction");
		assert.strictEqual(oStub.callCount, 0, "Did not ask the history");

	});


	QUnit.test("Should not ask history if viewLevel is given", function (assert) {

		// Arrange
		this.oTargetHandler._iCurrentLevel = 1;
		var oStub = this.stub(History.prototype, "getDirection").returns(HistoryDirection.Forwards);

		// Act
		var bBackwards = this.oTargetHandler._getDirection({
			askHistory: true,
			level: 0
		});

		// Assert
		assert.strictEqual(bBackwards, true, "Did return the backwards direction");
		assert.strictEqual(oStub.callCount, 0, "Did not ask the history");

	});

	QUnit.test("Should return a forwards navigation if nothing is specified and should not ask the history", function (assert) {
		// Arrange
		var oStub = this.stub(History.prototype, "getDirection");

		// Act
		var bBackwards = this.oTargetHandler._getDirection({
		});

		// Assert
		assert.strictEqual(bBackwards, false, "Did return the backwards direction");
		assert.strictEqual(oStub.callCount, 0, "Did not ask the history");
	});

	QUnit.test("Should remember the viewlevel after a direction is determined", function (assert) {
		this.oTargetHandler._getDirection({
			level: 1,
			direction: HistoryDirection.Forwards
		});

		// Act
		var bResult = this.oTargetHandler._getDirection({
			level: 0
		});

		assert.strictEqual(bResult, true, "Did do a backwards navigation because view level was 1 then it is 0");

	});
});