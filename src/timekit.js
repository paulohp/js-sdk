'use strict';

/*!
 * Timekit JavaScript SDK
 * Version: 0.0.1
 * http://timekit.io
 *
 * Copyright 2015 Timekit, Inc.
 * The Timekit JavaScript SDK is freely distributable under the MIT license.
 *
 */
var axios = require('axios');
var base64 = require('base-64');

function Timekit() {

  /**
   * Auth variables for login gated API methods
   * @type {String}
   */
  var userEmail;
  var userApiToken;

  /**
   * Default config
   * @type {Object}
   */
  var config = {
    app: 'demo',
    apiBaseUrl: 'https://api.timekit.io/',
    apiVersion: 'v2'
  };

  /**
   * Generate base64 string for basic auth purposes
   * @type {Function}
   * @return {String}
   */

  var encodeAuthHeader = function() {
    return base64.encode(userEmail + ':' + userApiToken);
  };

  /**
   * Build absolute URL for API call
   * @type {Function}
   * @return {String}
   */
  var buildUrl = function(endpoint) {
    return config.apiBaseUrl + config.apiVersion + endpoint;
  };

  /**
   * Prepare and make HTTP request to API
   * @type {Object}
   * @return {Promise}
   */
  var makeRequest = function(args) {

    args.url = buildUrl(args.url);
    args.headers = {
      'Timekit-App': config.app,
    };

    if (userEmail && userApiToken) { args.headers.Authorization = 'Basic ' + encodeAuthHeader(); }
    if (config.inputTimestampFormat) { args.headers['Timekit-InputTimestampFormat'] = config.inputTimestampFormat; }
    if (config.outputTimestampFormat) { args.headers['Timekit-OutputTimestampFormat'] = config.outputTimestampFormat; }
    if (config.timezone) { args.headers['Timekit-Timezone'] = config.timezone; }

    // args.transformResponse = [function(response) {
    //   // console.log('transformResponse');
    //   // console.log(JSON.parse(response));
    //   // if (response.data) {
    //   //   response.result = response.data.data || response.data;
    //   //   delete response.data;
    //   // }
    //   return response;
    // }];

    var request = axios(args);

    return request;
  };

  /**
   * Root Object that holds methods to expose for API consumption
   * @type {Object}
   */
  var TK = {};

  /**
   * Overwrite default config with supplied settings
   * @type {Function}
   * @return {Object}
   */
  TK.configure = function(custom) {
    for (var attr in custom) { config[attr] = custom[attr]; }
    return config;
  };

  /**
   * Returns the current config
   * @type {Function}
   * @return {Object}
   */
  TK.getConfig = function() {
    return config;
  };

  /**
   * Set the active user manuallt (happens automatically on timekit.auth())
   * @type {Function}
   */
  TK.setUser = function(email, apiToken) {
    if (email){ userEmail = email; }
    if (apiToken) { userApiToken = apiToken; }
  };

  /**
   * Returns the current active user
   * @type {Function}
   * @return {Object}
   */
  TK.getUser = function() {
    return {
      email: userEmail,
      apiToken: userApiToken
    };
  };

  /**
   * Authenticate a user to retrive API token for future calls
   * @type {Function}
   * @return {Promise}
   */
  TK.auth = function(email, password) {

    var r = makeRequest({
      url: '/auth',
      method: 'post',
      data: {
        email: email,
        password: password
      }
    });

    r.then(function(response) {
      TK.setUser(response.data.data.email, response.data.data.api_token);
    });

    return r;

  };

  /**
   * Find mutual availability across multiple users/calendars
   * @type {Function}
   * @return {Promise}
   */
  TK.findTime = function(emails, filters, future, length, sort) {

    return makeRequest({
      url: '/findtime',
      method: 'post',
      data: {
        emails: emails,
        filters: filters,
        future: future,
        length: length,
        sort: sort
      }
    });

  };

  /**
   * Get user's connected accounts
   * @type {Function}
   * @return {Promise}
   */
  TK.getAccounts = function() {

    return makeRequest({
      url: '/accounts',
      method: 'get'
    });

  };

  /**
   * Redirect to the Google signup/login page
   * @type {Function}
   * @return {String}
   */
  TK.accountGoogleSignup = function(shouldRedirect) {

    var url = buildUrl('/accounts/google/signup') + '?Timekit-App=' + config.app;

    if(shouldRedirect && window) {
      window.location.href = url;
    } else {
      return url;
    }

  };

  /**
   * Get user's Google calendars
   * @type {Function}
   * @return {Promise}
   */
  TK.getAccountGoogleCalendars = function() {

    return makeRequest({
      url: '/accounts/google/calendars',
      method: 'get'
    });

  };

  /**
   * Initiate a server sync on all the users accounts
   * @type {Function}
   * @return {Promise}
   */
  TK.accountSync = function() {

    return makeRequest({
      url: '/accounts/sync',
      method: 'get'
    });

  };

  /**
   * Get users calendars that are present on Timekit (synced from providers)
   * @type {Function}
   * @return {Promise}
   */
  TK.getCalendars = function() {

    return makeRequest({
      url: '/calendars',
      method: 'get'
    });

  };

  /**
   * Get users calendars that are present on Timekit (synced from providers)
   * @type {Function}
   * @return {Promise}
   */
  TK.getCalendar = function(token) {

    return makeRequest({
      url: '/calendars/' + token,
      method: 'get'
    });

  };

  /**
   * Get users contacts that are present on Timekit (synced from providers)
   * @type {Function}
   * @return {Promise}
   */
  TK.getContacts = function() {

    return makeRequest({
      url: '/contacts/',
      method: 'get'
    });

  };

  /**
   * Get all user's events present from synced accounts (use FindTime for more detailed querying)
   * @type {Function}
   * @return {Promise}
   */
  TK.getEvents = function(start, end) {

    return makeRequest({
      url: '/events',
      method: 'get',
      params: {
        start: start,
        end: end
      }
    });

  };

  /**
   * Get a user's anonymized availability (other user's on Timekit can be queryied by supplying their email)
   * @type {Function}
   * @return {Promise}
   */
  TK.getAvailability = function(start, end, email) {

    return makeRequest({
      url: '/events/availability',
      method: 'get',
      params: {
        start: start,
        end: end,
        email: email
      }
    });

  };

  /**
   * Get a user's meetings
   * @type {Function}
   * @return {Promise}
   */
  TK.getMeetings = function() {

    return makeRequest({
      url: '/meetings',
      method: 'get'
    });

  };

  /**
   * Get a user's specific meeting
   * @type {Function}
   * @return {Promise}
   */
  TK.getMeeting = function(token) {

    return makeRequest({
      url: '/meetings/' + token,
      method: 'get'
    });

  };

  /**
   * Get a user's specific meeting
   * @type {Function}
   * @return {Promise}
   */
  TK.createMeeting = function(what, where, suggestions) {

    return makeRequest({
      url: '/meetings',
      method: 'post',
      data: {
        what: what,
        where: where,
        suggestions: suggestions
      }
    });

  };

  /**
   * Get a user's specific meeting
   * @type {Function}
   * @return {Promise}
   */
  TK.updateMeeting = function(token, data) {

    return makeRequest({
      url: '/meetings/' + token,
      method: 'put',
      data: data
    });

  };

  /**
   * Set availability (true/faalse) on a meeting's suggestion
   * @type {Function}
   * @return {Promise}
   */
  TK.setMeetingAvailability = function(suggestionId, available) {

    return makeRequest({
      url: '/meetings/availability',
      method: 'post',
      data: {
        suggestion_id: suggestionId,
        available: available
      }
    });

  };

  /**
   * Book/finalize the meeting, sending out meeting invites to all participants
   * @type {Function}
   * @return {Promise}
   */
  TK.bookMeeting = function(suggestionId) {

    return makeRequest({
      url: '/meetings/book',
      method: 'post',
      data: {
        suggestion_id: suggestionId
      }
    });

  };

  /**
   * Invite users/emails to a meeting, sending out invite emails to the supplied addresses
   * @type {Function}
   * @return {Promise}
   */
  TK.inviteToMeeting = function(token, emails) {

    return makeRequest({
      url: '/meetings/' + token + '/invite',
      method: 'post',
      data: {
        emails: emails
      }
    });

  };

  /**
   * Create a new user with the given properties
   * @type {Function}
   * @return {Promise}
   */
  TK.createUser = function(firstName, lastName, email, password, timezone) {

    return makeRequest({
      url: '/users',
      method: 'post',
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        timezone: timezone
      }
    });

  };

  /**
   * Fetch current user data from server
   * @type {Function}
   * @return {Promise}
   */
  TK.getUserInfo = function() {

    return makeRequest({
      url: '/users/me',
      method: 'get'
    });

  };

  /**
   * Fetch current user data from server
   * @type {Function}
   * @return {Promise}
   */
  TK.updateUser = function(data) {

    return makeRequest({
      url: '/users/me',
      method: 'put',
      data: data
    });

  };

  /**
   * Get a user property by key
   * @type {Function}
   * @return {Promise}
   */
  TK.getUserProperties = function() {

    return makeRequest({
      url: '/properties',
      method: 'get'
    });

  };

  /**
   * Get a user property by key
   * @type {Function}
   * @return {Promise}
   */
  TK.getUserProperty = function(key) {

    return makeRequest({
      url: '/properties/' + key,
      method: 'get'
    });

  };

  /**
   * Set or update user properties
   * @type {Function}
   * @return {Promise}
   */
  TK.setUserProperties = function(data) {

    return makeRequest({
      url: '/properties',
      method: 'put',
      data: data
    });

  };

  return TK;

}

module.exports = new Timekit();
