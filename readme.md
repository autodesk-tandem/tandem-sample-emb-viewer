## Tandem Viewer TestBed

A test bed application for exercising the Tandem Viewer in an embedded viewer scenario.

Deals with authentication (Oxygen login) and loading a facility from Autodesk Tandem in vanilla js using the _Tandem SDK_ (@adsk/lmv-double-trouble). Snowpack is used as a development server (which is required for the login redirects).

## Pre-requisites

Make sure you have an account and access to at least one facility at https://tandem-stg.autodesk.com.

## Setup

After cloning this repo, run `npm install`.


## Start App

To start the development server, run `npm start`. It's opening the browser for you at http://localhost:8080 which should take you to the login first and then back to your app.

## Using the App

The test bed app is designed to bring in as few dependencies as possible.  It is plain Javascript and HTML with the exception of jQuery and Bootstrap just to do minimal styling.  The app is designed as simple "Stubs" of functionality that for the most part just dump out results to the Chrome console window.  These interactive tests will surface useful information that you can then use in some of your other code (e.g., URNs for Facilities, Models, etc.). In cases where input is required from the user, UI is as minimal as possible, or you are expected to change the code itself that supplies that input, or put a breakpoint in the debugger and change the value temporarily.

![Tandem TestBed App](./Readme_image_001.jpg)
