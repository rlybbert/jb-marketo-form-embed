/***************************************************************************
 *
 * AUTHOR: Jon Bourne, @jondbourne, jonbourne.com
 * 
 * REVISED: 2017-06-24
 *
 * DESCRIPTION: Extends embedded Marketo forms with additional functionality
 * 
 * DOCUMENTATION: https://github.com/jonbourne/jb-marketo-form-embed
 * 
 ***************************************************************************/

function JBMarketoForm() {

	/*
	 * Base URL of your Marketo instance
	 */
	this.baseUrl              = '//app-sj09.marketo.com' ;
	
	/*
	 * Your Marketo instance's Munchkin ID, found in default Munchkin embed code
	 */
	this.munchkinId           = '666-QLD-841' ;
	
	/*
	 * ID of your default (global) Marketo form
	 */
	this.formId               = 0 ;



	/******* NO NEED TO EDIT BELOW THIS LINE *******/

	// Reference to this object, simplifies scoping
	var jbmf = this;
	
	// Track performance/timing data
	var p = {};
	p.sinceConnectStartBegin = Date.now() - window.performance.timing.connectStart;
	p.begin = Date.now();

	// Store form object in global variable, kicks off form rendering
	setTimeout(function(){
		if(!window.jbmf) {
			window.jbmf = {};
			window.jbmf.forms = [];
			window.jbmf.ids = [];
		}
		window.jbmf.forms.push(jbmf);
		if(window.jbmf.ids.indexOf(jbmf.formId) === -1) {
			window.jbmf.ids.push(jbmf.formId);
		}
		load();
	},0);

	// Initialize properties/settings
	jbmf.removeFields         = [];
	jbmf.formClass            = '';
	jbmf.destyle              = false;
	jbmf.submitText           = '';
	jbmf.redirectUrl          = '';
	jbmf.redirectDelay        = 0;
	jbmf.successMsg           = '';
	jbmf.basicStyles          = false;
	jbmf.performance          = {};
	
	// Declare private variables
	var
		logMode               = false ,           // enable/disable logging output to console
		loading               = false ,           // true while form dependencies are loading
		loadForm              = false ,           // form-loading interval handle
		MarketoForms2         = {} ,              // MktoForms2 API
		scriptId              = '' ,              // ID attribute of the script tag in DOM
		formHtml              = {} ,              // For form HTML element
		formHtmlId            = '' ,              // For form HTML element's ID attribute
		onReadyCallbacks      = [] ,              // Callback functions for onReady handler
		onValidateCallbacks   = [] ,              // Callback functions for onValidate handler
		onSubmitCallbacks     = [] ,              // Callback functions for onSubmit handler
		onSuccessCallbacks    = [] ,              // Callback functions for onSuccess handler
		successMsgCtnr        = '' ,              // Success message container HTML
		whenReadyHasRun,                          // TODO: figure out why whenReady runs twice
		$,                                        // jQuery library, loaded with MktoForms2
		form$                                     // jQuery-selected form
		; // end var declarations

	/* 
	 * PUBLIC FUNCTIONS
	 */

	// Records function(s) to call when the form is ready/rendered
	jbmf.onReady = function(callback) {
		m('onReady callback');
		if(typeof callback === 'function') {
			onReadyCallbacks.push(callback);
		}
	};

	// Records function(s) to call when form validation is triggered
	jbmf.onValidate = function(callback) {
		m('onReady callback');
		if(typeof callback === 'function') {
			onValidateCallbacks.push(callback);
		}
	};

	// Records function(s) to call on form submission
	jbmf.onSubmit = function(callback) {
		m('onSubmit callback');
		if(typeof callback === 'function') {
			onSubmitCallbacks.push(callback);
		}
	};

	// Records function(s) to call on successful form submission
	jbmf.onSuccess = function(callback) {
		m('onSuccess callback');
		if(typeof callback === 'function') {
			onSuccessCallbacks.push(callback);
		}
	};

	// Enable console logging
	jbmf.log = function() {
		logMode = true;
	};


	/* 
	 * PRIVATE FUNCTIONS
	 */

	// A simple logging function
	function m(consoleLogMsg) {
		if(logMode) {
			window.console.log( consoleLogMsg ) ;
		}
	}

	// Are required settings initialized?
	function isInitReady() {
		if(	!jbmf.baseUrl || !jbmf.munchkinId || !jbmf.formId ) {
			return false;
		}
		else {
			return true;
		}
	}

	// Kicks off form rendering
	function load() {
		// Ensure required settings are defined
		if(	isInitReady() ) {
			loadForm = setInterval( render , 50);
		}
		else {
			m('Initialization failed. Please set baseUrl, munchkinId and formId.');
		}
	}

	// Load dependencies
	function loadDependencies() {
		// Load Marketo Forms API
		if( !loading && !window.MktoForms2 ) {

			var firstScriptTag, tag;

			firstScriptTag = document.getElementsByTagName('script')[0];
			tag = document.createElement('script');
			tag.src = jbmf.baseUrl + "/js/forms2/js/forms2.min.js";
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			loading = true;

		}
	}

	// Are dependencies loaded?
	function dependenciesAreLoaded() {
		if(!dependencyIsLoaded('MktoForms2')) { return false; }
		
		loading = false;
		
		m('All dependencies are loaded.');
		
		// Log performance data
		p.dependenciesLoaded = Date.now() - p.begin;
		
		return true;
	}

	// Check whether necessary libraries are loaded
	function dependencyIsLoaded(depToCheck) {
		if(typeof window[depToCheck] === 'undefined') {
			return false;
		}
		else {
			m(depToCheck + ' is loaded.');
			return true;
		}
	}

	// Sets id attribute of current script tag
	function setScriptId() {
		
		// Get all scripts
		var allScripts = document.getElementsByTagName('script');
		
		// Get index of last script
		var lastScript = allScripts.length - 1;
		
		// Get last script
		jbmf.script = allScripts[ lastScript ];
		
		// Set id attribute of script tag
		jbmf.script.id = 'jb_mktoForm_' + jbmf.formId + '_' + lastScript;
		
		// Store script and id
		scriptId = jbmf.script.id;
		
		m('Script element\'s id attribute set: script#' + jbmf.script.id + '.');
	}

	// Remove (non-required) fields (from global form)
	function removeFormFields() {
		$.each(jbmf.removeFields, function(k,v){
			if ( $('#' + formHtmlId + ' #' + v + '.mktoRequired').length > 0 ) {
				m('Form field "' + v + '" could not be removed from form#' + formHtmlId + ' because it is required.');
			}
			else {
				$('#' + formHtmlId + ' #' + v).closest('.mktoFormRow').remove();
				m('Form field "' + v + '" removed from form#' + formHtmlId + '.');
			}
		});
	}

	// Set form element id attribute
	function setFormId(form) {
		
		// Set formHtmlId based on scriptId
		formHtmlId = jbmf.script.id.replace("jb_mktoForm_","mktoForm_");

		form$ = $('form#mktoForm_' + form.getId());
		form$.attr('id',formHtmlId);
		m('Form element\'s id attribute set: form#' + formHtmlId + '.');
	}

	// Add form class(es)
	function setFormClass() {
		if(jbmf.formClass) {
			form$.addClass(jbmf.formClass);
			m('Form class(es) added to form#' + formHtmlId + ': ' + jbmf.formClass + '.');
		}
	}

	// Remove all Marketo form styles
	function removeFormStyles() {
		if(jbmf.destyle) {
			$(document.styleSheets).each( function(i,ss) {
				if( typeof ss.href === 'string' ) {
					if( ss.href.search('forms2/css') > 0 ) {
						$(ss).attr('disabled',true);
					}
				}
			});
			$('#' + formHtmlId + ' style').remove();
			$('#' + formHtmlId + ', #' + formHtmlId + ' [style]').attr('style','');
			m('Form styles for form#' + formHtmlId + ' have been removed.');
		}
		form$.removeAttr('style');
	}

	// Apply basic form styles
	function basicStyles() {
		if(jbmf.basicStyles) {
			var css;
			css="";
			css+=".mktoForm * {font-family:inherit;font-size:inherit}";
			css+=".mktoFormRow{padding-bottom:.5em}";
			css+=".mktoForm input[type=url],.mktoForm input[type=text],.mktoForm input[type=date],.mktoForm input[type=tel],.mktoForm input[type=email],.mktoForm input[type=number],.mktoForm textarea.mktoField,.mktoForm select.mktoField{padding:.5em 4px .4em;width:calc(100% - 10px);border:1px solid #888;font-size:.9em;}";
			css+=".mktoButtonRow{padding-top:.75em;}";
			css+=".mktoButton{padding:.5em 1em .4em;}";
			css+=".mktoAsterix{display: none;}";
			css+=".mktoLabel{font-size:.9em}"
			css+=".mktoRequiredField .mktoLabel:after{content:' *';font-weight:bold;font-size:.9em;}";
			css+=".mktoForm .mktoError {position: absolute;right:auto !important;bottom:auto !important;z-index: 99;color: #bf0000;}";
			css+=".mktoForm .mktoError .mktoErrorArrowWrap {width: 16px;height: 8px;overflow: hidden;position: absolute;top: 0;left: 5px;z-index: 100;}";
			css+=".mktoForm .mktoError .mktoErrorArrow {background-color: #e51b00;border: 1px solid #9f1300;border-right: none;border-bottom: none;display: inline-block;height: 16px;-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);transform: rotate(45deg);-ms-transform: rotate(45deg);width: 16px;margin-top: 5px;}";
			css+=".mktoForm .mktoError .mktoErrorMsg {display: block;margin-top: 7px;background-color: #e51b00;background-image: -webkit-linear-gradient(#e51b00 43%, #ba1600 100%);background-image: -moz-linear-gradient(#e51b00 43%, #ba1600 100%);background-image: linear-gradient(#e51b00 43%, #ba1600 100%);background-image: -ms-linear-gradient(#e51b00 43%, #ba1600 100%);border: 1px solid #9f1300;-webkit-border-radius: 6px;border-radius: 6px;-webkit-box-shadow: rgba(0,0,0,0.65) 0 2px 7px, inset #ff3c3c 0 1px 0px;box-shadow: rgba(0,0,0,0.65) 0 2px 7px, inset #ff3c3c 0 1px 0px;color: #f3f3f3;font-size: 1em;line-height: 1.2em;max-width: 16em;padding: 0.4em 0.6em;text-shadow: #901100 0 -1px 0;}";

			$('head').append('<style type="text/css">' + css + '</style>')
			m('Basic styling has been applied to form#' + formHtmlId + '.');
		}
		form$.removeAttr('style');
	}

	// Set custom submit button text on the form
	function setSubmitText() {
		if(jbmf.submitText) {
			$("button.mktoButton[type=submit]").html(jbmf.submitText);
			m('Form submit text changed on form#' + formHtmlId + '.');
		}
	}

	// Show successMsg, if defined
	function showSuccessMessage() {

		// Show success message or forward to thank you page
		if(jbmf.successMsg) {
			
			m('Form success message displayed.');

			// Create success message
			successMsgCtnr = '<div id="' + formHtmlId + '_success" style="display:none;" class="' + jbmf.successMsgClass + '"></div>' ;
			
			$('script#' + scriptId).before(successMsgCtnr);
			$('#' + formHtmlId + '_success').html(jbmf.successMsg).fadeIn('fast');
			form$.slideToggle();
			
			// Pause, then redirect to another page
			if(jbmf.redirectDelay && jbmf.redirectUrl) {
				setTimeout(function(){
					location.href = jbmf.redirectUrl;
				}, jbmf.redirectDelay*1000);
			}

		}
	}

	// Redirect to redirectUrl, if defined
	function redirect() {
		if(jbmf.redirectUrl) {
			
			m('Redirecting to custom success URL...');

			// Send to alternate, user-configured destination
			setTimeout(function(){

				location.href = jbmf.redirectUrl;

			}, jbmf.redirectDelay * 1000); // delay, if set

		}
	}

	// Render the form
	function render() {
		if( dependenciesAreLoaded() ) {

			// Stop loading
			clearInterval( loadForm );

			// Set script id attribute
			setScriptId();
			
			// Make shortcuts to forms API and jQuery
			MktoForms2 = window.MktoForms2;
			$ = MktoForms2.$.noConflict();

			// Create form element
			formHtml = '<form id="mktoForm_' + jbmf.formId + '" style="display:none;"></form>' ;
			$('script#' + scriptId).before(formHtml);

			// Load the requested Marketo form
			MktoForms2.loadForm(jbmf.baseUrl, jbmf.munchkinId, jbmf.formId, function(){
				// Log performance data
				p.formLoaded = Date.now() - p.begin;
			});
			m('Form form#mktoForm_' + jbmf.formId + ' is loading...');

			onReady();

		}
		else {
			m('Loading dependencies...');
			loadDependencies();
		}
	}

	// Add onReady handler 
	function onReady() {
		MktoForms2.whenReady(function(form){
			
			// Log performance data
			p.formReady = Date.now() - p.begin;

			m('Form form#mktoForm_' + jbmf.formId + ' is ready.');

			// Call onReady handler
			onReadyCallback(form);

			// Set form id to avoid potential conflicts
			setFormId(form);

			// Add form class
			setFormClass();

			// Remove fields for various field configurations
			removeFormFields();

			// Remove all Marketo form styles
			removeFormStyles();

			// Apply basic form styling
			basicStyles();

			// Set custom submit button text on the form
			setSubmitText();

			// Log performance data
			p.customizationsComplete = Date.now() - p.begin;

			// Call onSubmit handler
			onValidate(form);

			// Call onSubmit handler
			onSubmit(form);

			// Call onSuccess handler
			onSuccess(form);

		});
	}

	// Call onReady callback function(s), if specified
	function onReadyCallback(form) {
		$.each(onReadyCallbacks, function (i, readyFn){
			readyFn(form);
		});
	}

	// Add onValidate handler
	function onValidate(form) {
		form.onValidate(function(isValid){
			
			m('Form form#mktoForm_' + jbmf.formId + ' is being validated.');

			// Call onReady handler
			onValidateCallback(isValid);

		});
	}

	// Call onValidate callback function(s), if specified
	function onValidateCallback(form) {
		$.each(onValidateCallbacks, function (i, validateFn){
			validateFn(form);
		});
	}

	// Add onSubmit handler
	function onSubmit(form) {
		form.onSubmit(function(form){
			
			m('Form form#mktoForm_' + jbmf.formId + ' has been submitted but not verified as success.');

			// Call onReady handler
			onSubmitCallback(form);

		});
	}

	// Call onSubmit callback function(s), if specified
	function onSubmitCallback(form) {
		$.each(onSubmitCallbacks, function (i, submitFn){
			submitFn(form);
		});
	}

	// Add onSuccess handler
	function onSuccess(form) {

		form.onSuccess(function(values) {

			m('Form form#mktoForm_' + jbmf.formId + ' submitted successfully.');

			// Fire callback, pass form and values
			onSuccessCallback(values);

			// If set, show custom success message and hide form
			showSuccessMessage();

			// Redirect user to follow-up URL
			redirect();

			return false;
		});

		// Log performance data
		p.totalRunTime = Date.now() - p.begin;
		p.sinceConnectStartEnd = Date.now() - window.performance.timing.connectStart;
		delete p.begin;
		jbmf.performance = p;
		m('Run time, in milliseconds: ' + JSON.stringify(p));

	}

	// Call onSuccess callback function(s), if specified
	function onSuccessCallback(values) {
		$.each(onSuccessCallbacks, function (i, successFn){
			successFn(values);
		});
	}

}