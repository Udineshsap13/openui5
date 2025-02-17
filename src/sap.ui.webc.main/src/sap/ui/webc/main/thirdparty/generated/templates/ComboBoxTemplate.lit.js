sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="ui5-combobox-root">${ context.hasValueState ? block1(context) : undefined }<input id="ui5-combobox-input" .value="${litRender.ifDefined(context.value)}" inner-input placeholder="${litRender.ifDefined(context.placeholder)}" ?disabled=${context.disabled} ?readonly=${context.readonly} value-state="${litRender.ifDefined(context.valueState)}" @input="${context._input}" @change="${context._inputChange}" @click=${context._click} @keydown="${context._keydown}" @focusin="${context._focusin}" @focusout="${context._focusout}" aria-expanded="${litRender.ifDefined(context.open)}" role="combobox" aria-haspopup="listbox" aria-autocomplete="both" aria-describedby="${litRender.ifDefined(context.valueStateTextId)}" aria-label="${litRender.ifDefined(context.ariaLabelText)}" aria-required="${litRender.ifDefined(context.required)}" data-sap-focus-ref />${ context.readonly ? block2(context, tags, suffix) : undefined }${ context.icon ? block3() : undefined }${ !context.readonly ? block4(context, tags, suffix) : undefined }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<span id="${litRender.ifDefined(context._id)}-valueStateDesc" class="ui5-hidden-text">${litRender.ifDefined(context.valueStateText)}</span>`;
	const block2 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} class="ui5-input-readonly-icon" name="not-editable" @click="${context._readonlyIconClick}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;
	const block3 = (context, tags, suffix) => litRender.html`<slot name="icon"></slot>`;
	const block4 = (context, tags, suffix) => litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="slim-arrow-down" slot="icon" tabindex="-1" input-icon ?pressed="${context._iconPressed}" @click="${context._arrowClick}" dir="${litRender.ifDefined(context.effectiveDir)}" accessible-name="${litRender.ifDefined(context._iconAccessibleNameText)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>`;

	return block0;

});
