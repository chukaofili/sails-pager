/**
 * paginatejs
 */
var _ = require('lodash');
var Promise = require('bluebird');
module.exports = {
    paginate: function(model, criteria, currentPage, perPage, populateData, sort, cb) {
        return new Promise(function(resolve, reject) {
            var pagination = {
                page: parseInt(currentPage) || 1,
                limit: parseInt(perPage) || 20
            };
            var conditions = criteria || {};
            var populate_data = populateData || [];
            model.count(conditions).then(function(count) {
                var findQuery = model.find(conditions);
                if (sort) {
                    findQuery = findQuery.sort(sort);
                }
                if (_.isArray(populate_data) && !_.isEmpty(populate_data)) {
                    _(populate_data).forEach(function(populate) {
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
            model.findOne(conditions).populate(populateData).then(function(data) {
                var count = data[populateData].length;
                var findQuery = model.findOne(conditions).populate(populateData, {
                    skip: skip,
                    limit: pagination.limit
                });
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