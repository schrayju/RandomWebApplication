const helper = require('../helper.js');
const FilmDao = require('../dao/filmDao.js');
const express = require('express');
var serviceRouter = express.Router();

helper.log('- Service Film');

serviceRouter.get('/film/gib/:id', function(request, response) {
    helper.log('Service Film: Client requested one record, id=' + request.params.id);

    const filmDao = new FilmDao(request.app.locals.dbConnection);
    try {
        var result = filmDao.loadById(request.params.id);
        helper.log('Service Film: Record loaded');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Film: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/film/alle', function(request, response) {
    helper.log('Service Film: Client requested all records');

    const filmDao = new FilmDao(request.app.locals.dbConnection);
    try {
        var result = filmDao.loadAll();
        helper.log('Service Film: Records loaded, count=' + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Film: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/film/existiert/:id', function(request, response) {
    helper.log('Service Film: Client requested check, if record exists, id=' + request.params.id);

    const filmDao = new FilmDao(request.app.locals.dbConnection);
    try {
        var result = filmDao.exists(request.params.id);
        helper.log('Service Film: Check if record exists by id=' + request.params.id + ', result=' + result);
        response.status(200).json(helper.jsonMsgOK({ 'id': request.params.id, 'existiert': result }));
    } catch (ex) {
        helper.logError('Service Film: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post('/film', function(request, response) {
    helper.log('Service Film: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = '';
    if (helper.isUndefined(request.body.genre)) {
        errorMsgs.push('genre fehlt');
    } else if (helper.isUndefined(request.body.genre.id)) {
        errorMsgs.push('genre gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.fsk)) {
        errorMsgs.push('fsk fehlt');
    } else if (!helper.isNumeric(request.body.fsk)) {
        errorMsgs.push('fsk muss eine Zahl sein');
    } else if (request.body.fsk < 0 || request.body.fsk > 18) {
        errorMsgs.push('fsk muss eine Zahl zwischen 0 und 18 sein');
    }        
    if (helper.isUndefined(request.body.dauer)) {
        errorMsgs.push('dauer fehlt');
    } else if (!helper.isNumeric(request.body.dauer)) {
        errorMsgs.push('dauer muss eine Zahl sein');
    } else if (request.body.dauer <= 0) {
        errorMsgs.push('dauer muss eine Zahl > 0 sein');
    }        
    if (helper.isUndefined(request.body.regie)) 
        request.body.regie = '';
    if (helper.isUndefined(request.body.darsteller)) 
        request.body.darsteller = '';
    if (helper.isUndefined(request.body.preis)) {
        errorMsgs.push('preis fehlt');
    } else if (!helper.isNumeric(request.body.preis)) {
        errorMsgs.push('preis muss eine Zahl sein');
    } else if (request.body.preis <= 0) {
        errorMsgs.push('preis muss eine Zahl > 0 sein');
    }
    if (helper.isUndefined(request.body.coverpfad)) 
        request.body.coverpfad = null;
    if (helper.isUndefined(request.body.videopfad)) 
        request.body.videopfad = null;
    if (helper.isUndefined(request.body.imdb)) 
        request.body.imdb = null;    
    
    if (errorMsgs.length > 0) {
        helper.log('Service Film: Creation not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Hinzufügen nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const filmDao = new FilmDao(request.app.locals.dbConnection);
    try {
        var result = filmDao.create(request.body.bezeichnung, request.body.beschreibung, request.body.genre.id, request.body.fsk, request.body.dauer, request.body.regie, request.body.darsteller, request.body.preis, request.body.coverpfad, request.body.videopfad, request.body.imdb);
        helper.log('Service Film: Record inserted');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Film: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put('/film', function(request, response) {
    helper.log('Service Film: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = '';
    if (helper.isUndefined(request.body.genre)) {
        errorMsgs.push('genre fehlt');
    } else if (helper.isUndefined(request.body.genre.id)) {
        errorMsgs.push('genre gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.fsk)) {
        errorMsgs.push('fsk fehlt');
    } else if (!helper.isNumeric(request.body.fsk)) {
        errorMsgs.push('fsk muss eine Zahl sein');
    } else if (request.body.fsk < 0 || request.body.fsk > 18) {
        errorMsgs.push('fsk muss eine Zahl zwischen 0 und 18 sein');
    }        
    if (helper.isUndefined(request.body.dauer)) {
        errorMsgs.push('dauer fehlt');
    } else if (!helper.isNumeric(request.body.dauer)) {
        errorMsgs.push('dauer muss eine Zahl sein');
    } else if (request.body.dauer <= 0) {
        errorMsgs.push('dauer muss eine Zahl > 0 sein');
    }        
    if (helper.isUndefined(request.body.regie)) 
        request.body.regie = '';
    if (helper.isUndefined(request.body.darsteller)) 
        request.body.darsteller = '';
    if (helper.isUndefined(request.body.preis)) {
        errorMsgs.push('preis fehlt');
    } else if (!helper.isNumeric(request.body.preis)) {
        errorMsgs.push('preis muss eine Zahl sein');
    } else if (request.body.preis <= 0) {
        errorMsgs.push('preis muss eine Zahl > 0 sein');
    }
    if (helper.isUndefined(request.body.coverpfad)) 
        request.body.coverpfad = null;
    if (helper.isUndefined(request.body.videopfad)) 
        request.body.videopfad = null;
    if (helper.isUndefined(request.body.imdb)) 
        request.body.imdb = null;

    if (errorMsgs.length > 0) {
        helper.log('Service Film: Update not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Update nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const filmDao = new FilmDao(request.app.locals.dbConnection);
    try {
        var result = filmDao.update(request.body.id, request.body.bezeichnung, request.body.beschreibung, request.body.genre.id, request.body.fsk, request.body.dauer, request.body.regie, request.body.darsteller, request.body.preis, request.body.coverpfad, request.body.videopfad, request.body.imdb);
        helper.log('Service Film: Record updated, id=' + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Film: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete('/film/:id', function(request, response) {
    helper.log('Service Film: Client requested deletion of record, id=' + request.params.id);

    const filmDao = new FilmDao(request.app.locals.dbConnection);
    try {
        var obj = filmDao.loadById(request.params.id);
        filmDao.delete(request.params.id);
        helper.log('Service Film: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ 'gelöscht': true, 'eintrag': obj }));
    } catch (ex) {
        helper.logError('Service Film: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;