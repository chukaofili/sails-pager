/**
 * paginatejs
 */
var _ = require('lodash');
var Promise = require('bluebird');
module.exports = {
    paginate: function(model, criteria, fields, currentPage, perPage, populateData, sort, cb) {
        return new Promise(function(resolve, reject) {
            var pagination = {
                page: parseInt(currentPage) || 1,
                limit: parseInt(perPage) || 20
            };
            var conditions = criteria || {};
            var populate_data = populateData || [];
            model.count(conditions).then(function(count) {
				var findQuery;
				if(fields.length > 0) {
					findQuery = model.find(conditions, {select:fields});
				}
				else {
					findQuery = model.find(conditions);
				}
                if (sort) {
                    findQuery = findQuery.sort(sort);
                }
                if (_.isArray(populate_data) && !_.isEmpty(populate_data)) {
                    _(populate_data).forEach(function(populate) {
                        //console.log(populate);
                        if (_.isObject(populate)) {
                            findQuery = findQuery.populate(populate.name, populate.query);
                        } else {
                            findQuery = findQuery.populate(populate);
                        }
                    });
                }
                findQuery = findQuery.paginate(pagination);
                return [count, findQuery];
            }).spread(function(count, data) {
                var numberOfPages = Math.ceil(count / pagination.limit);
                var nextPage = parseInt(pagination.page) + 1;
                var meta = {
                    page: pagination.page,
                    perPage: pagination.limit,
                    previousPage: (pagination.page > 1) ? parseInt(pagination.page) - 1 : false,
                    nextPage: (numberOfPages >= nextPage) ? nextPage : false,
                    pageCount: numberOfPages,
                    total: count
                }
                var response = {
                    message: 'Data retrieved successfully',
                    data: data,
                    meta: meta
                };
                if (typeof cb === "function") {
                    return cb(null, response);
                }
                return resolve(response);
            }).catch(function(err) {
                if (typeof cb === "function") {
                    return cb(err, null);
                }
                return reject(err);
            });
        });
    },
    paginatePopulate: function(model, criteria, currentPage, perPage, populateData, sort, cb) {
        return new Promise(function(resolve, reject) {
            var pagination = {
                page: parseInt(currentPage) || 1,
                limit: parseInt(perPage) || 20
            };
            var skip = pagination.page > 0 ? ((pagination.page - 1) * pagination.limit) : 0;
            var conditions = criteria || {};
            var objPopulatedData = populateData;
            var queryPopulatedData = {};// query
            if(_.isObject(populateData)){
                //has an object as the populatedData to use as populate has
                //sure a single model can be paginatePopulate. so, this requires an object
                //not an array of object(s)
                populateData = objPopulatedData.name;
                queryPopulatedData = objPopulatedData.query;
            }
            model.findOne(conditions).populate(populateData, queryPopulatedData).then(function(data) {
                var count = data[populateData].length;
                if(!_.isEmpty(queryPopulatedData)){
                    queryPopulatedData.skip = skip;
                    queryPopulatedData.limit = pagination.limit;
                }
                var findQuery = model.findOne(conditions).populate(populateData, queryPopulatedData);
                return [count, findQuery];
            }).spread(function(count, data) {
                var numberOfPages = Math.ceil(count / pagination.limit);
                var nextPage = parseInt(pagination.page) + 1;
                var meta = {
                    page: pagination.page,
                    perPage: pagination.limit,
                    previousPage: (pagination.page > 1) ? parseInt(pagination.page) - 1 : false,
                    nextPage: (numberOfPages >= nextPage) ? nextPage : false,
                    pageCount: numberOfPages,
                    total: count
                }
                var response = {
                    message: 'Data retrieved successfully',
                    data: data[populateData],
                    meta: meta
                };
                if (typeof cb === "function") {
                    return cb(null, response);
                }
                return resolve(response);
            }).catch(function(err) {
                if (typeof cb === "function") {
                    return cb(err, null);
                }
                return reject(err);
            });
        });
    }
};
