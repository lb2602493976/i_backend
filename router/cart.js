/*处理路由地址中所有以/cart开头的请求*/
const express = require('express')
const pool = require('../pool.js')
router = express.Router()
module.exports = router