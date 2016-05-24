# sails-pager
Pagination Service for SailsJS projects

This module makes it easy to integrate pagination into your [SailsJS](http://sailsjs.org) application.e.js.

* [Installation](#installation)
* [Usage](#usage)

# Installation

* Make sure that [Node.js](https://nodejs.org/) installed.
* Install Node.js library with `npm`:
```shell
npm install sails-pager
```

# Usage

## paginate(options)

This function helps you paginate any model passed to the paginate function.

* Create `YourController.js` file. Insert into following code.
```javascript
var pager = require('sails-pager');

module.exports = {
    list: function(req, res) {
        var perPage = req.query.per_page;
        var currentPage = req.query.page;

        var conditions = {active: true};
        pager.paginate(res, SailsModelHere, conditions, currentPage, perPage, [{name: 'AssociatedModel', query: {isDeleted: false}}], 'createdAt DESC');
  },
}
```

The `pager.paginate()` function takes the following options:

1. *res* (required): This is the res variable from your sailsjs controller.
2. *model* (required): Pass the sails model you want to query.
3. *conditions* (required | object, pass *{}* if you have no conditions): This are the conditions for the query pass to the model in 2 above.
4. *currentPage* (required | integer): This is the current page value for the dataset to return.
5. *perPage* (optional | integer): The number of results to return per page
6. *populateData* (optional | array/collection): This is the associated sails model to populate. Multiple models can be populated eg: If main model=User then you can use ['pets', 'images'] or ['pets'] to populate only the User's associated pets. You can also pass populate queries, but you'll have to use a slightly different syntax by pass an object with the name & query properties. eg model=User, ['pets', {name: 'images', query: {isDeleted: false}}], this will populate the User's pets & all images that have not been deleted.
7. *sort* (optional | string): Pass the same sailsjs sort syntax. 

Options order: `pager.paginate(res, model, conditions, currentPage, perPage, populateData, sort);`

Please note that the pagination service will handle your output in a specific format.


## paginatePupulate(options)

This function helps you paginate any populated data stripping the main model data eg: If a User has many pets and you would like to retrieve a paginated set of the users pets, You'll pass the User as the main model and pass the pets as the populateData, please note this does not support queries yet like the main paginate() function.

The `pager.paginatePopulate()` function takes the same options as the `paginate()` with the exception of the populateData: You can only pass a string to the `pager.paginatePopulate()` and not an array cos you can only paginate one set of pupolated data at once.

1. *populateData* (required | string)

## Response

Example response payload;
```
{
	"message": "Data retrieved successfully",
	"data": [{data goes here}],
	"meta": {
		"page": 1,
		"perPage": 20,
		"previousPage": false,
		"nextPage": 2,
		"pageCount": 4,
		"total": 79
	}
}
```