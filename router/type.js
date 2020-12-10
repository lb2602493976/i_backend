/*处理路由地址中所有以/favorite开头的请求*/
const express = require('express')
const pool = require('../pool.js')
router = express.Router()
module.exports = router

/*
2.1	获取课程分类
接口URL
{{url}}/type
请求方式
GET
成功响应示例
 [
        {
            "tpid": 1,
            "tpname": "基础课程"
        },
        {
            "tpid": 2,
            "tpname": "核心课程"
        },
        {
            "tpid": 3,
            "tpname": "进阶课程"
        }
]

*/
router.get('/',(req,res,next)=>{
	// 1.获取信息
	// 2.执行sql命令
	let sql='SELECT tpid,tpname FROM type ORDER BY tpid'
	// 3.获取响应数据
	pool.query(sql,(err,result)=>{
		if(err){
			next(err)
			return
		}
		res.send(result)
	})
})



