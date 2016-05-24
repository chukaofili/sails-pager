/**
 * paginatejs
 */
var _ = require('lodash');
module.exports = {
    paginate: function(res, model, criteria, currentPage, perPage, populate_data, sort) {
        var pagination = {
            page: parseInt(currentPage) || 1,
            limit: parseInt(perPage) || 20
        };
        var conditions = criteria || {};
        var populate_data = populate_data || [];
        model.count(conditions).then(function(count) {
            var findQuery = model.find(conditions);
            if (sort) {
                findQuery = findQuery.sort(sort);
            }
            if (_.isArray(populate_data) && !_.isEmpty(populate_data)) {
                _(populate_data).forEach(function(populate) {
                    if(_.isObject(populate)){
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
            return res.status(200).json(response);
        }).catch(function(err) {
            return res.negotiate(err);
        });
    },
    paginatePopulate: function(res, model, criteria, currentPage, perPage, populate_data, populate_sort) {
        var pagination = {
            page: parseInt(currentPage) || 1,
            limit: parseInt(perPage) || 20
        };
        var skip = pagination.page > 0 ? ((pagination.page - 1) * pagination.limit) : 0;
        var conditions = criteria || {};
        model.findOne(conditions).populate(populate_data).then(function(data){
            var count = data[populate_data].length;
            var findQuery = model.findOne(conditions).populate(populate_data, {skip: skip, limit: pagination.limit});
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
                data: data[populate_data],
                meta: meta
            };
            return res.status(200).json(response);
        }).catch(function(err) {
            return res.negotiate(err);
        });
    }
};