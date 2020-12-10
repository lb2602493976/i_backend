/*处理路由地址中所有以/favorite开头的请求*/
const express = require('express')
const pool = require('../pool.js')
router = express.Router()
module.exports = router

/**
 * 1.7	添加收藏
 *接口URL
 *		{{url}}/favorite/add
 *请求方式
 *		POST
 *请求 Content-Type
 *		application/json
 *请求Body参数
 *		uid	3	必需	-用户id 从服务器端session中读取登录的用户编号
 *		cid	7	必填	-课程id
 *成功响应示例
 *{
 *   "code": 200,
 *   "msg": "success",
 *   "fid": 2
 *}
 *失败响应示例
 *{
 *   "code": 403,
 *   "msg": "failed"
 *}
 */
router.post('/add', (req, res, next)=>{
	//1.读取客户端提交的数据
	// 此处无需进行登录验证
	// let uid = req.session.userInfo.uid 	//从登录信息中读取uid
	let uid=req.uid               //loginCheckMiddleware添加的属性,req.uid
	let cid = req.body.cid				//客户端提交的课程编号
	if(!cid){
		let output = {
			code: 403,
			msg: 'cid required'
		}
		res.send(output)
		return 
	}
	let fTime = Date.now()				//当前系统时间戳
	
	//2.执行数据库插入操作
	let sql1 = 'SELECT fid FROM favorite WHERE userId=? AND courseId=?'
	pool.query(sql1, [uid, cid], (err, result)=>{
		if(err){
			next(err)
			return
		}
		if(result.length === 0){	//情形1：当前用户尚未添加过指定的课程到收藏夹——INSERT
			let sql2 = 'INSERT INTO favorite VALUES(NULL, ?, ?, ?)'
			pool.query(sql2, [uid, cid, fTime], (err, result)=>{
				if(err){
					next(err)
					return
				}
				let output = {
					code: 200,
					msg: 'favorite add succ',
					fid: result.insertId		//INSERT语句生成的自增编号
				}
				res.send(output)
			})
		}else {						//情形2：当前用户添加过指定的课程到收藏夹了——UPDATE
			let sql3 = 'UPDATE favorite SET fTime=? WHERE fid=?'
			pool.query(sql3, [fTime, result[0].fid], (err, result)=>{
				if(err){
					next(err)
					return
				}
				let output = {
					code: 201,
					msg: 'favorite update succ'
				}
				res.send(output)
			})
		}
	})
	
	//3.向客户端输出响应消息
})

/*
	1.8:收藏列表
接口URL
{{url}}/favorite/list
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
uid	4	必需	-用户id从session中读取登录的用户编号即可
成功响应示例
 [
        {
            "title": "07HTML零基础入门",
            "pic": "img-course\/06.png",
            "price": 399,
            "courseId": 7,
            "fid": 2,
            "fTime": 1578015036
        },
       ....
]
失败响应示例
[  ]

*/
router.get('/list',(req,res,next)=>{
	// 1.读取客户端的数据
	let uid=req.uid    //登录中间件检查req中添加req.uid属性
	// 2.执行数据库操作
	let sql="SELECT title,pic,price,courseId,fid,fTime FROM favorite AS f,course AS c WHERE c.cid=f.courseId AND f.userId=?"
	pool.query(sql,uid,(err,result)=>{
		if(err){
			next(err)
			return
		}
		// 3.向客户端输出响应消息
		res.send(result)
	})
	
})

