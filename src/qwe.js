function configure(exports) {
    "use strict";

    exports.debugMode = false;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Errors
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // State
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function State(stateName) {
        stateName._name = stateName;
    }

    /**
     *
     * @param name
     * @param parentState
     * @param isFirstChild
     */
    function stCreate(name, parentState, isFirstChild) {
        var st = new State(name);

        return st;
    }

    function stSetFirstChild(state, stateName) {

    }

    function stRmChild(state, stateName) {

    }

    function stAddChild(parentState, state) {

    }

    function stInspect(state) {

    }

    function stGetName(state) {

    }

    function stSetName(state) {

    }

    function stOn(state, evt, callback) {

    }

    exports.stCreate = stCreate;
    exports.stSetFirstChild = stSetFirstChild;
    exports.stRmChild = stRmChild;
    exports.stAddChild = stAddChild;
    exports.stInspect = stInspect;
    exports.stGetName = stGetName;
    exports.stSetName = stSetName;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // State Machine Methods
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function smInit(obj, state) {
    }

    function smGetState(obj) {
    }

    function smGetStateName(obj) {
    }

    function smTran(obj, targetState) {
    }

    function smSend(obj, evt) {
    }

    function smRoute(args) {
    }

    function smListen(obj, evt) {
    }

    exports.smInit = smInit;
    exports.smGetState = smGetState;
    exports.smGetStateName = smGetStateName;
    exports.smTran = smTran;
    exports.smSend = smSend;
    exports.smRoute = smRoute;
    exports.smListen = smListen;

    return exports;
}

var qwe = configure(typeof exports === 'undefined' ? this.qwe = {} : exports);

var Top = qwe.stCreate('Top');
var Offline = qwe.stCreate('Main', Top);
var Connecting = qwe.stCreate('Connecting', Top);
var Online = qwe.stCreate('Online', Top);

Offline.connecting = function (o, e) {

};


