const helper = require('../helper.js');
const VorstellungDao = require('../dao/vorstellungDao.js');
const express = require('express');
var serviceRouter = express.Router();

helper.log('- Service Vorstellung');

serviceRouter.get('/vorstellung/gib/:id', function(request, response) {
    helper.log('Service Vorstellung: Client requested one record, id=' + request.params.id);

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var result = vorstellungDao.loadById(request.params.id);
        helper.log('Service Vorstellung: Record loaded');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/vorstellung/film/:id', function(request, response) {
    helper.log('Service Vorstellung: Client requested all records of movie, id=' + request.params.id);

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var result = vorstellungDao.loadAllByFilm(request.params.id);
        helper.log('Service Vorstellung: Record for specific movie loaded');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error loading record for specific film by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/vorstellung/kinosaal/:id', function(request, response) {
    helper.log('Service Vorstellung: Client requested all records of room, id=' + request.params.id);

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var result = vorstellungDao.loadAllByRoom(request.params.id);
        helper.log('Service Vorstellung: Record for specific room loaded');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error loading record for specific room by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/vorstellung/sitzfrei', function(request, response) {
    helper.log('Service Vorstellung: Client requested check, if specific seat is available');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id missing');
    if (helper.isUndefined(request.body.reihe)) 
        errorMsgs.push('reihe missing');
    if (helper.isUndefined(request.body.sitzplatz)) 
        errorMsgs.push('sitzplatz missing');

    if (errorMsgs.length > 0) {
        helper.log('Service Vorstellung: Check not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Check nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var show = vorstellungDao.loadById(request.body.id);
        
        // result is true if seat is available, otherwise false
        var result = true;
        if (request.body.reihe <= 0 || request.body.reihe > show.kinosaal.sitzreihen) {
            result = false;
        } else if (request.body.sitzplatz <= 0 || request.body.sitzplatz > show.kinosaal.sitzeproreihe) {
            result = false;
        } else {
            result = vorstellungDao.seatAvailable(request.body.id, request.body.reihe, request.body.sitzplatz);
        }
        
        helper.log('Service Vorstellung: Check if seat is available successfull');
        response.status(200).json(helper.jsonMsgOK({ 'id': request.body.id, 'reihe': request.body.reihe, 'sitzplatz': request.body.sitzplatz, 'frei': result }));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error checking if specific seat is available. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/vorstellung/alle', function(request, response) {
    helper.log('Service Vorstellung: Client requested all records');

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var result = vorstellungDao.loadAll();
        helper.log('Service Vorstellung: Records loaded, count=' + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/vorstellung/existiert/:id', function(request, response) {
    helper.log('Service Vorstellung: Client requested check, if record exists, id=' + request.params.id);

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var result = vorstellungDao.exists(request.params.id);
        helper.log('Service Vorstellung: Check if record exists by id=' + request.params.id + ', result=' + result);
        response.status(200).json(helper.jsonMsgOK({ 'id': request.params.id, 'existiert': result }));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post('/vorstellung', function(request, response) {
    helper.log('Service Vorstellung: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.film)) {
        errorMsgs.push('film fehlt');
    } else if (helper.isUndefined(request.body.film.id)) {
        errorMsgs.push('film gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.kinosaal)) {
        errorMsgs.push('kinosaal fehlt');
    } else if (helper.isUndefined(request.body.kinosaal.id)) {
        errorMsgs.push('kinosaal gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.zeitpunkt)) {
        errorMsgs.push('zeitpunkt fehlt');
    } else if (!helper.isGermanDateTimeFormat(request.body.zeitpunkt)) {
        errorMsgs.push('zeitpunkt hat ein falsches Format, erlaubt: dd.mm.jjjj hh.mm.ss');
    }
    
    if (errorMsgs.length > 0) {
        helper.log('Service Vorstellung: Creation not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Hinzufügen nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var result = vorstellungDao.create(request.body.film.id, request.body.kinosaal.id, helper.parseDateTimeString(request.body.zeitpunkt));
        helper.log('Service Vorstellung: Record inserted');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put('/vorstellung', function(request, response) {
    helper.log('Service Vorstellung: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.film)) {
        errorMsgs.push('film fehlt');
    } else if (helper.isUndefined(request.body.film.id)) {
        errorMsgs.push('film gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.kinosaal)) {
        errorMsgs.push('kinosaal fehlt');
    } else if (helper.isUndefined(request.body.kinosaal.id)) {
        errorMsgs.push('kinosaal gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.zeitpunkt)) {
        errorMsgs.push('zeitpunkt fehlt');
    } else if (!helper.isGermanDateTimeFormat(request.body.zeitpunkt)) {
        errorMsgs.push('zeitpunkt hat ein falsches Format, erlaubt: dd.mm.jjjj hh.mm.ss');
    }
    if (helper.isUndefined(request.body.reservierungen)) {
        request.body.reservierungen = [];
    } else if (!helper.isArray(request.body.reservierungen)) {
        request.body.reservierungen = [];
    }

    if (errorMsgs.length > 0) {
        helper.log('Service Vorstellung: Update not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Update nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var result = vorstellungDao.update(request.body.id, request.body.film.id, request.body.kinosaal.id, helper.parseDateTimeString(request.body.zeitpunkt), request.body.reservierungen);
        helper.log('Service Vorstellung: Record updated, id=' + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete('/vorstellung/:id', function(request, response) {
    helper.log('Service Vorstellung: Client requested deletion of record, id=' + request.params.id);

    const vorstellungDao = new VorstellungDao(request.app.locals.dbConnection);
    try {
        var obj = vorstellungDao.loadById(request.params.id);
        vorstellungDao.delete(request.params.id);
        helper.log('Service Vorstellung: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ 'gelöscht': true, 'eintrag': obj }));
    } catch (ex) {
        helper.logError('Service Vorstellung: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;