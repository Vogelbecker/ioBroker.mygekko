/* eslint-disable no-prototype-builtins */
/* eslint-disable no-var */
'use strict';

/*
 * Created with @iobroker/create-adapter v1.23.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const retus = require("retus");

// Load your modules here, e.g.:
// const fs = require("fs");

class Mygekko extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'mygekko',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        //this.log.info('myGekko IP Adresse lautet ' + this.config.mygekkoIP);
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const ip = this.config.mygekkoIP;
        const m_user = this.config.mygekkoUser;
        const m_pass = this.config.mygekkoPW;
        //const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
        
        const werte = async (device, name, type, role, writable, value) => {

            await this.setObjectNotExistsAsync(device, {
                type: 'state',
                common: {
                    name: name,
                    type: type,
                    role: role,
                    read: true,
                    write: writable,
                },
                native: {},
            });
            await this.setStateAsync(device, { val: value, ack: true });
        }
        
        const blind = async () => {
            var data = new Object
            var status = new Object
            var blinds = new Object
            var prefix = "http://";
            var suffix = "/api/v1/var/blinds";
            var url = prefix + ip + suffix;
            var { body } = retus(url + "?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            blinds = body
            this.log.debug(data)
            body = retus(url + "/status?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            status = body.body
        
            //ausgabe zusammenbauen
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var blindName = blinds[key].name
                    var temp
        
                    temp = status[key].sumstate.value.split(";")
                    
                    var state = temp[0]
                    var position = temp[1]
                    var angle = temp[2]
                    var Sum = temp[3] 
                    var SlatRotation = temp[4]

                    var objName = `blind.${key}`;

                    this.setObjectNotExists(objName, {
                        type: 'channel',
                        common: { name: blindName},
                        native: {}
                    });
                    werte(objName + '.state',  'State',    'boolean',  'switch',        false,state)
                    werte(objName + '.position',  'Position',    'number',  'level.blind',true,        position)
                    werte(objName + '.angle',  'Angle',    'number',  'level.tilt',true,        angle)
                    werte(objName + '.sumstate',  'sum state',    'boolean',  'indicator',false,        Sum)
                    werte(objName + '.slatrotation',  'Slate Rotation',    'number',  'indicator',false,        SlatRotation)
                    
                    /*
                    console.log("interner name " + key);
                    console.log("Name " + blindName)
                    console.log("State " + state);
                    console.log("posi" + position);
                    console.log("angle " + angle);
                    console.log("Sumstate " + Sum);
                    console.log("SlatRotation " + SlatRotation);
                    console.log("\n") */
                    }
                } 
        }
        
        const lamp = async () => {
            /////  Lampen            //////////////////////////        
            var data = new Object;
            var status = new Object;
            var lamps = new Object;
            var prefix = 'http://';
            var suffix = '/api/v1/var/lights';
            var url = prefix + ip + suffix;
            var { body } = retus(url + "?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            lamps = body
            this.log.debug(data)
            body = retus(url + "/status?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            status = body.body

            //await this.createDeviceAsync('lights');
            //ausgabe zusammenbauen
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var LampName;
                    var temp;
                    var state;
                    var DimmValue;
                    var RGBColor;
                    var Sum;

                    LampName = lamps[key].name;
                    temp = status[key].sumstate.value.split(';');
                    
                    state = temp[0];
                    DimmValue = temp[1];
                    RGBColor = temp[2];
                    Sum = temp[3];
                    
                    var objName = `light.${key}`;

                    this.setObjectNotExists(objName, {
                        type: 'channel',
                        common: { name: LampName},
                        native: {}
                    });
                   
                    werte(objName + '.sumstate',  'sum state',    'boolean',  'indicator',        false,    true)
                    werte(objName + '.state',     'state',        'boolean',  'switch',           true,     state)
                    werte(objName + '.dimmv',     'Dimmer Value', 'number',   'level.dimmer',     true,     DimmValue)
                    werte(objName + '.rgb',       'RGB Values',   'number',   'level.color.rgb',  true,     RGBColor)
                    /*
                    this.log.info('interner name ' + key);
                    this.log.info('Name ' + LampName);
                    this.log.info('State ' + state);
                    this.log.info('DimmV' + DimmValue);
                    this.log.info('RGB ' + RGBColor);
                    this.log.info('Sumstate ' + Sum);
                    this.log.info('\n'); */
                }
            } 

        }
        
        const roomTemp = async () => {

            var data = new Object
            var status = new Object
            var roomTemps = new Object
            var prefix = "http://";
            var suffix = "/api/v1/var/roomtemps";
            var url = prefix + ip + suffix;
            var { body } = retus(url + "?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            roomTemps = body
            this.log.debug(data)
            body = retus(url + "/status?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            status = body.body
        
            //ausgabe zusammenbauen
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var roomName = roomTemps[key].name
                    var temp
        
                    temp = status[key].sumstate.value.split(";")
                    
                    var actTemp = temp[0]
                    var setPointTemp = temp[1]
                    var valve = temp[2]
                    var mode = temp[3]
                    var reserved = temp[4]
                    var tempAdjust = temp[5]
                    var cooling = temp[6]
                    var sum = temp[7]
                    var humidity = temp[8]
                    var airQuality = temp[9]
                    var floorTemp = temp[10]
        
                    var objName = `roomTemp.${key}`;

                    this.setObjectNotExists(objName, {
                        type: 'channel',
                        common: { name: roomName},
                        native: {}
                    });
                    werte(objName + '.actTemp',     'Actual Temp',      'number',  'value.temperature',        false,   actTemp)
                    werte(objName + '.setPointTemp','SetPoint Temp',    'number',  'value.temperature',        false,   setPointTemp)
                    werte(objName + '.valve',       'Valve',            'number',  'value.valve ',             false,   valve)
                    werte(objName + '.mode',        'Mode',             'number',  'value',                    false,   mode)
                    werte(objName + '.reserved',    'Reserved',         'number',  'value',                    false,   reserved)
                    werte(objName + '.tempAdjust',  'Temp Adjust',      'number',  'value.temperature',        true,    tempAdjust)
                    werte(objName + '.cooling',     'Cooling',          'number',  'value',                    false,   cooling)
                    werte(objName + '.sum',         'SumState',         'number',  'value',                    false,   sum)
                    werte(objName + '.humidity',    'Humidity',         'number',  'value.humidity',           false,   humidity)
                    werte(objName + '.airQuality',  'AirQuality',       'number',  'value',                    false,   airQuality)
                    werte(objName + '.floorTemp',   'FloorTemp',        'number',  'value.temperature',        false,   floorTemp)
                    /*
                    console.log("interner name " + key);
                    console.log("Name " + roomName)
                    console.log("actTemp " + actTemp)
                    console.log("setPointTemp " + setPointTemp);
                    console.log("valve" + valve);
                    console.log("mode " + mode);
                    console.log("reserved " + reserved);
                    console.log("tempAdjust " + tempAdjust);
                    console.log("cooling " + cooling);
                    console.log("sum " + sum);
                    console.log("humidity " + humidity);
                    console.log("airQuality " + airQuality);
                    console.log("floorTemp " + floorTemp);
        
                    console.log("\n")*/
                    }
                } 
        }
        
        const vents = async () => {
            var data = new Object
            var status = new Object
            var vents = new Object
            var prefix = "http://";
            var suffix = "/api/v1/var/vents";
            var url = prefix + ip + suffix;
            var { body } = retus(url + "?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            vents = body
            this.log.debug(data)
            body = retus(url + "/status?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            status = body.body
        
            //ausgabe zusammenbauen
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var ventName = vents[key].name
                    var temp
        
                    temp = status[key].sumstate.value.split(";")
                    
                    var level = temp[0]
                    var type = temp[1]
                    var mode = temp[2]
                    var bypassstate = temp[3]
                    var maxLevel = temp[4]
                    var humidity = temp[5]
                    var quality = temp[6]
                    var co2 = temp[7]
                    var tempSupplyAir = temp[8]
                    var tempExhaustAir = temp[9]
                    var tempOutsideAir = temp[10]
                    var tempOutgoingAir = temp[11]
                    var levelIn = temp[12]
                    var levelOut = temp[13]
                    var sum = temp[14]
                    var subType = temp[15]


                    var objName = `vent.${key}`;

                    this.setObjectNotExists(objName, {
                        type: 'channel',
                        common: { name: ventName},
                        native: {}
                    });
                    werte(objName + '.level',           'Level',            'number',  'value',             true,   level)
                    werte(objName + '.type',            'Type',             'number',  'value',             false,  type)
                    werte(objName + '.mode',            'Mode',             'number',  'value',             false,  mode)
                    werte(objName + '.bypassstate',     'Bypass State',     'number',  'value',             false,  bypassstate)
                    werte(objName + '.maxLevel',        'Max Level',        'number',  'value.max',         false,  maxLevel)
                    werte(objName + '.humidity',        'Humidity',         'number',  'value.humidity',    false,  humidity)
                    werte(objName + '.quality',         'Quality',          'number',  'level.co2',         false,  quality)
                    werte(objName + '.co2',             'CO2',              'number',  'level.co2',         false,  co2)
                    werte(objName + '.tempSupplyAir',   'Temp Supply Air',  'number',  'value.temperature', false,  tempSupplyAir)
                    werte(objName + '.tempExhaustAir',  'Temp Exhaust Air', 'number',  'value.temperature', false,  tempExhaustAir)
                    werte(objName + '.tempOutsideAir',  'Temp Outside Air', 'number',  'value.temperature', false,  tempOutsideAir)
                    werte(objName + '.tempOutgoingAir', 'Temp Outgoing Air','number',  'value.temperature', false,  tempOutgoingAir)
                    werte(objName + '.levelIn',         'Level In',         'number',  'value',             false,  levelIn)
                    werte(objName + '.levelOut',        'Level Out',        'number',  'value',             false,  levelOut)
                    werte(objName + '.sum',             'Sum',              'number',  'value',             false,  sum)
                    werte(objName + '.subType',         'Sub Type',         'number',  'value',             false,  subType)
/*
                    console.log("interner name " + key);
                    console.log("Name " + ventName)
                    console.log("level " + level)
                    console.log("type " + type);
                    console.log("mode" + mode);
                    console.log("bypassstate " + bypassstate);
                    console.log("maxLevel " + maxLevel);
                    console.log("humidity " + humidity);
                    console.log("quality " + quality);
                    console.log("co2 " + co2);
                    console.log("tempSupplyAir " + tempSupplyAir);
                    console.log("tempExhaustAir " + tempExhaustAir);
                    console.log("tempOutsideAir " + tempOutsideAir);
                    console.log("tempOutgoingAir " + tempOutgoingAir);
                    console.log("levelIn " + levelIn);
                    console.log("levelOut " + levelOut);
                    console.log("sum " + sum);
                    console.log("subType " + subType);
        
        
                    console.log("\n") */
                    }
                } 

        }

        const heatingSystem = async () => {
            var data = new Object
            var status = new Object
            var heatingsystems = new Object
            var prefix = "http://";
            var suffix = "/api/v1/var/heatingsystems";
            var url = prefix + ip + suffix;
            var { body } = retus(url + "?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            heatingsystems = body
            this.log.debug(data)
            body = retus(url + "/status?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            status = body.body
        
            //ausgabe zusammenbauen
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var heatingName = heatingsystems[key].name
                    var temp
        
                    temp = status[key].sumstate.value.split(";")
                    
                    var type = temp[0]
                    var cooling = temp[1]
                    var flowTemp = temp[2]
                    var setpointTemp = temp[3]
                    var state = temp[4]
                    var sum = temp[5]
                    
                    var objName = `heatingSystems.${key}`;

                    this.setObjectNotExists(objName, {
                        type: 'channel',
                        common: { name: heatingName},
                        native: {}
                    });
                    werte(objName + '.type',           'Type',            'number',  'value',   false,       type)
                    werte(objName + '.cooling',        'cooling',         'number',  'value',   false,    cooling)
                    werte(objName + '.flowTemp',       'flowTemp',        'number',  'value',   false,     flowTemp)
                    werte(objName + '.setpointTemp',   'setpointTemp',    'number',  'value',   false,     setpointTemp)
                    werte(objName + '.state',          'state',           'number',  'value',   false,     state)
                    werte(objName + '.sum',            'sum',             'number',  'value',   false,     sum)
        /*
                    console.log("interner name " + key);
                    console.log("Name " + heatingName)
                    console.log("type " + type)
                    console.log("cooling " + cooling)
                    console.log("flowTemp " + flowTemp)
                    console.log("setpointTemp " + setpointTemp)
                    console.log("state " + state)
                    console.log("sum " + sum)
        
                    console.log("\n") */
                    }
                } 

        }

        const heatingcircuit = async () => {
            var data = new Object
            var status = new Object
            var heatingcircuits = new Object
            var prefix = "http://";
            var suffix = "/api/v1/var/heatingcircuits";
            var url = prefix + ip + suffix;
            var { body } = retus(url + "?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            heatingcircuits = body
            this.log.debug(data)
            body = retus(url + "/status?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            status = body.body

            //ausgabe zusammenbauen
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var heatingcircuitsName = heatingcircuits[key].name
                    var temp

                    temp = status[key].sumstate.value.split(";")
                    
                    
                    var type  = temp[0]
                    var flowTemp = temp[1]
                    var pump = temp[2]
                    var cooling = temp[3]
                    var flowTempSetpoint = temp[4]
                    var valve = temp[5]
                    var sumstate = temp[6]
                    
                    var objName = `heatingcircuit.${key}`;

                    this.setObjectNotExists(objName, {
                        type: 'channel',
                        common: { name: heatingcircuitsName},
                        native: {}
                    });
                    werte(objName + '.type',                'Type',             'number',  'value',   false,    type)
                    werte(objName + '.flowTemp',            'flowTemp',         'number',  'value',   false,     flowTemp)
                    werte(objName + '.pump',                'pump',             'number',  'value',   false,     pump)
                    werte(objName + '.cooling',             'cooling',          'number',  'value',   false,     cooling)
                    werte(objName + '.flowTempSetpoint',    'flowTempSetpoint', 'number',  'value',   false,     flowTempSetpoint)
                    werte(objName + '.valve',               'valve',            'number',  'value',   false,    valve)
                    werte(objName + '.sumstate',            'sumstate',         'number',  'value',   false,     sumstate)
/*
                    console.log("interner name " + key);
                    console.log("Name " + heatingcircuitsName)
                    console.log("type " + type)
                    console.log("flowTemp " + flowTemp)
                    console.log("pump " + pump)
                    console.log("cooling " + cooling)
                    console.log("flowTempSetpoint " + flowTempSetpoint)
                    console.log("valve " + valve)
                    console.log("sumstate " + sumstate)
                    console.log("\n") */
                    }
                } 
        }

        const hotwater_system = async () => {

            var data = new Object
            var status = new Object
            var hotwater_systems = new Object
            var prefix = "http://";
            var suffix = "/api/v1/var/hotwater_systems";
            var url = prefix + ip + suffix;
            var { body } = retus(url + "?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            hotwater_systems = body
            this.log.debug(data)
            body = retus(url + "/status?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            status = body.body

            //ausgabe zusammenbauen
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var hotwater_systemsName = hotwater_systems[key].name
                    var temp

                    temp = status[key].sumstate.value.split(";")
                    
                    
                    var type  = temp[0]
                    var cooling  = temp[1]
                    var setpointTemp  = temp[2]
                    var topTemp  = temp[3]
                    var bottomTemp  = temp[4]
                    var collectorTemp  = temp[5]
                    var state  = temp[6]
                    var sum = temp[7]
                    
                    var objName = `hotwater_systems.${key}`;

                    this.setObjectNotExists(objName, {
                        type: 'channel',
                        common: { name: hotwater_systemsName},
                        native: {}
                    });
                    werte(objName + '.type',           'Type',             'number',  'value',  false,     type)
                    werte(objName + '.cooling',        'Cooling',          'number',  'value',  false,      cooling)
                    werte(objName + '.setpointTemp',   'Set Point Temp',   'number',  'value',  false,      setpointTemp)
                    werte(objName + '.topTemp',        'Top Temp',         'number',  'value',  false,      topTemp)
                    werte(objName + '.bottomTemp',     'Bottom Temp',      'number',  'value',  false,      bottomTemp)
                    werte(objName + '.collectorTemp',  'Collector Temp',   'number',  'value',  false,      collectorTemp)
                    werte(objName + '.state',          'State',            'number',  'value',  false,      state)
                    werte(objName + '.sum',            'Sum State',        'number',  'value',  false,      sum)
                    
/*
                    console.log("interner name " + key);
                    console.log("Name " + hotwater_systemsName)
                    
                    console.log("type " + type)
                    console.log("cooling " + cooling)
                    console.log("setpointTemp " + setpointTemp)
                    console.log("topTemp " + topTemp)
                    console.log("bottomTemp " + bottomTemp)
                    console.log("collectorTemp " + collectorTemp)
                    console.log("state " + state)
                    console.log("sum " + sum)

                    console.log("\n") */
                    }
                } 
        }

        const energycost = async () => {

            var data = new Object
            var status = new Object
            var energycosts = new Object
            var prefix = "http://";
            var suffix = "/api/v1/var/energycosts";
            var url = prefix + ip + suffix;
 
            var { body } = retus(url + "?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            energycosts = body
            this.log.debug(data)
            body = retus(url + "/status?username="+m_user+"&password="+m_pass,{ method: "get", json: {}} )
            status = body.body
            this.log.debug(status)

            //ausgabe zusammenbauen
            for (var key in status) {
                if (status.hasOwnProperty(key)) {
                    var energyName = energycosts[key].name
                    var temp

                    temp = status[key].sumstate.value.split(";")
                    
                    
                    var actPower = temp[0]
                    var energyToday = temp[1]
                    var energyMonth = temp[2]
                    var energySum = temp[3]
                    var powerMax = temp[4]
                    var unitEnergy = temp[5]
                    var unitPower = temp[6]
                            
                    var objName = `energycost.${key}`;

                    this.setObjectNotExists(objName, {
                        type: 'channel',
                        common: { name: energyName},
                        native: {}
                    });
                    werte(objName + '.actPower',           'Actual Power',          'number',  'value',        false,   actPower)
                    werte(objName + '.energyToday',        'Energy Today',          'number',  'value',        false,   energyToday)
                    werte(objName + '.energyMonth',        'Energy Month',          'number',  'value',        false,   energyMonth)
                    werte(objName + '.energySum',          'Energy Sum',            'number',  'value',        false, energySum)
                    werte(objName + '.powerMax',           'Power Max',             'number',  'value.max',    false,  powerMax)
                    /*
                    this.log.info("interner name " + key);
                    this.log.info("Name " + energyName)
                    
                    this.log.info("actPower " + actPower)
                    this.log.info("energyToday " + energyToday)
                    this.log.info("energyMonth " + energyMonth)
                    this.log.info("energySum " + energySum)
                    this.log.info("powerMax " + powerMax)
                    this.log.info("unitEnergy " + unitEnergy)
                    this.log.info("unitPower " + unitPower)
*/
                   
                    }
                } 

        }



        
        setInterval(() => {
            blind()
            lamp();
            roomTemp();
            vents();
            heatingSystem();
            heatingcircuit();
            hotwater_system();
            energycost();
        }, this.config.mygekkoRefresh);
        
        
       
/*
        setTimeout(function () {
            stop();
        },200) */


        
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        
        await this.setObjectAsync('testVariable', {
            type: 'state',
            common: {
                name: 'testVariable',
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: true,
            },
            native: {},
        });
        */
        // in this template all states changes inside the adapters namespace are subscribed
        this.subscribeStates('*');

        /*
        setState examples
        you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
        */
        // the variable testVariable is set to true as command (ack=false)
        await this.setStateAsync('testVariable', true);

        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        await this.setStateAsync('testVariable', { val: true, ack: true });

        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state && state.from != `system.adapter.${this.namespace}` && state.ack == true) {             
            // The state was changed
            const ip = this.config.mygekkoIP;
            const m_user = this.config.mygekkoUser;
            const m_pass = this.config.mygekkoPW;
            var prefix = "http://";
            var changed_id = new Object
            var url
            changed_id = id.split('.');

            if(changed_id[2] == "blind") {
                // changed_id[3] = item 
                // changed_id[4] = position
                // ${state.val} = value
                if(changed_id[4] == "angle") {
                    url = "blinds/"+changed_id[3]+"/scmd/set?value=S"+ state.val; 
                }
                if(changed_id[4] == "position") {
                    url = "blinds/"+changed_id[3]+"/scmd/set?value=P"+ state.val; 
                }
            }
            if(changed_id[2] == "light") {
                if(changed_id[4] == "state") {
                    url = "lights/"+changed_id[3]+"/scmd/set?value="+ state.val; 
                }
            }
            if(changed_id[2] == "roomTemp") {
                if(changed_id[4] == "tempAdjust") {
                    url = "roomtemps/"+changed_id[3]+"/scmd/set?value=K"+ state.val; 
                }
            }
            if(changed_id[2] == "vent") {
                if(changed_id[4] == "level") {
                    url = "vents/"+changed_id[3]+"/scmd/set?value="+ state.val; 
                }
            }
            
            
            url = prefix + ip + "/api/v1/var/" + url + "&username="+m_user+"&password="+m_pass
            this.log.debug(url)
            
            var { body } = retus(url,{ method: "get"})
            this.log.debug(body)
                    
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            //this.log.info(`state ${id} deleted`);
        }
    }

    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    // 	if (typeof obj === 'object' && obj.message) {
    // 		if (obj.command === 'send') {
    // 			// e.g. send email or pushover or whatever
    // 			this.log.info('send command');

    // 			// Send response in callback if required
    // 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    // 		}
    // 	}
    // }

}


// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Mygekko(options);
} else {
    // otherwise start the instance directly
    new Mygekko();
}
