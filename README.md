# jb-marketo-form-embed

## Description

### Makes marketers’ lives better

This script adds helpful functionality to embedded Marketo forms. It’s designed by and for marketers to solve common marketing challenges and overcome limitations of the default Marketo form functionality in an easy-to-use package built for non-coders.

### Coders like it, too

Behind the scenes, the script uses and makes available the [MktoForms2 API](http://developers.marketo.com/javascript-api/forms/api-reference/). Basically, that means that it is still developer friendly, too, so your developer counterparts can easily extend and customize the functionality further if they wish without having to

## Features

1.  Change the submit button text
1.  Change the URL to which the user is redirected after a successful form submission
1.  Hide form and display a success message upon successful form submission
1.  Delay before redirecting user; only used if `successMsg` is not blank
1.  Apply a custom `class` attribute to the form element; especially useful when form is `destyle`’d
1.  Remove _all_ of Marketo’s form styles to get a pristinely _un-styled_ form
1.  Apply very basic styling to the form elements and validation error messages
1.  Remove fields, so you can use a global form for many different use cases
1.  Callback functions for adding custom functionality: onReady, onValidate, onSubmit, onSuccess
1.  Logging load time performance information to console

## Usage

<pre><code>&lt;script id=&quot;jb-marketo-form-embed.js&quot;&gt;&lt;/script&gt;
&lt;script&gt;
    (function(){
        f                 = new JBMarketoForm;
        f.formId          = 1273;
        f.submitText      = 'Custom Submit Button Text';
        f.successMsg      = '&lt;div&gt;&lt;strong&gt;Thank you&lt;/strong&gt;&lt;br&gt;Form submitted!&lt;/div&gt;';
        f.redirectUrl     = 'http://jonbourne.com/';
        f.redirectDelay   = 10;
        f.destyle         = true;
        f.basicStyles     = true;
        f.formClass       = 'class1 class2';
        f.removeFields    = ['Salutation','MiddleName','Title'];
        f.onReady(myReadyFunction);
        f.onValidate(myValidateFunction);
        f.onSubmit(mySubmitFunction);
        f.onSuccess(mySuccessFunction);
        f.log();
    })();
&lt;/script&gt;
</code></pre>

## Settings

Configure form settings on the `f` object (which is an instance of `JBMarketoForm`). The `baseURL`, `munchkinId` and `formId` properties are required, but all others are optional.

**Note**: any of these properties can be defined as a global default in `jb-marketo-form-embed.js`, which will make them optional in individual instances of the embed code. The demo code, for example, specifies the `baseUrl` and `munchkinId` in the `jb-marketo-form-embed.js` as defaults so that those two pieces of information do not need to be included in each form's embed code.

<dl>
<dt><strong>baseUrl</strong></dt>
    <dd><em>string, <strong>required</strong></em><br> The base URL of your Marketo subscription. It's the subdomain you see when you're logged in.</dd>
<dt><strong>munchkinId</strong></dt>
    <dd><em>string, <strong>required</strong></em><br> Your Marketo subscription's Munchkin ID. You can get this from the standard Marketo form embed code or in Admin > Munchkin.</dd>
<dt><strong>formId</strong></dt>
    <dd><em>integer, <strong>required</strong></em><br> The ID of the Marketo form you want to embed. You can get this from Marketo's default embed code for the form. (You can also get it from the form's URL in Marketo, but it might be tricky if you're not sure what to look for. If you're not sure, check the embed code first, and then look at the form's URL. You'll see it. </dd>
<dt><strong>removeFields</strong></dt>
    <dd><em>array, optional</em><br> fields to remove from form<br> cannot be required fields</dd>
<dt><strong>formClass</strong></dt>
    <dd><em>string, optional</em><br> one or more space-delimited CSS classes to add to form</dd>
<dt><strong>destyle</strong></dt>
    <dd><em>boolean, optional</em><br> if true, removes all Marketo-generated form styles</dd>
<dt><strong>submitText</strong></dt>
    <dd><em>string, optional</em><br> custom text for submit/call-to-action button on form</dd>
<dt><strong>successMsg</strong></dt>
    <dd><em>string, optional</em><br> message to show after successful form submission, accepts HTML</dd>
<dt><strong>redirectDelay</strong></dt>
    <dd><em>integer, optional</em><br> number of seconds to delay before redirect after successful form submission</dd>
<dt><strong>redirectUrl</strong></dt>
    <dd><em>string, optional</em><br> URL to which to redirect after successful form submission</dd>
<dt><strong>onReady</strong></dt>
    <dd><em>function, optional</em><br> Call named function when form is ready, with one argument: the MktoForms2 object itself. The full <a href="http://developers.marketo.com/javascript-api/forms/api-reference/">MktoForms2 API</a> can be accessed through this object.</dd>
<dt><strong>onValidate</strong></dt>
    <dd><em>function, optional</em><br> Call named function each time form validation is triggered, with one argument: a boolean value where true means form input is valid and false means it's not valid.</dd>
<dt><strong>onSubmit</strong></dt>
    <dd><em>function, optional</em><br> Call named function when form is submitted (after validation) but before form data is sent to Marketo, with one argument: the MktoForms2 object itself. The full <a href="http://developers.marketo.com/javascript-api/forms/api-reference/">MktoForms2 API</a> can be accessed through this object.</dd>
<dt><strong>onSuccess</strong></dt>
    <dd><em>function, optional</em><br> Call named function when Marketo confirms that the form submission was successful, with one argument: an object containing the values that were submitted.</dd>
</dl>

## Planned features that are not yet developed

*   Add support for multiple forms
*   Add support for form localization (multiple languages)
*   Add option to show a custom success container, instead of using `successMsg`
*   Add support for modal forms
