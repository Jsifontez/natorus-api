class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    // 1A) filtering
    const queryObj = { ...this.queryString }
    const excludeFields = ['page', 'sort', 'limit', 'fields']
    excludeFields.forEach((el) => delete queryObj[el])

    // 1B) advanced filtering
    // create a string of queryObj
    let queryStr = JSON.stringify(queryObj)
    // replace globally the filtering options
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    // use the queryStr but in object
    this.query = this.query.find(JSON.parse(queryStr))

    // we return the entire object (this) to be able to chain methods
    // like filter().sort().limit()...
    return this
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      // we create a string of fields space separated
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      // we add a default sort
      this.query = this.query.sort('-createdAt')
    }

    return this
  }

  limitFields() {
    // 3) Field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      // we excluede the `__v` field created by mongo in the default query
      this.query = this.query.select('-__v')
    }

    return this
  }

  paginate() {
    // 4) Pagination
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    const skip = (page - 1) * limit

    // page=3&limit=10, 1-10, page 1; 11-20, page 2; 21-30, page 3
    this.query = this.query.skip(skip).limit(limit)

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments()
    //   if (skip >= numTours) throw new Error('This page does not exist')
    // }

    return this
  }
}

module.exports = APIFeatures
