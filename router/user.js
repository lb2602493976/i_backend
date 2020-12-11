// 所有已/user开头的请求
const express = require('express')
const pool = require('../pool.js')
router = express.Router()


let sessionTest = null;
/**
 * 1.1	用户注册
 *接口URL
 *{{url}}/user/register
 *请求方式
 *POST
 *请求 Content-Type
 *application/json
 *请求Body参数
 *参数	示例值	必填	参数描述
 *  uname	zhangsan	必填	-用户名
 *  upwd	123456	必填	-密码
 *  phone	13333333333	必填	-手机号
 *  captcha	ad31	必填	-验证码
 *成功响应示例
 *{
 *    "code": 200,
 *    "msg": "register success",
 *    "uid": 7
 *}
 *
 */
router.post('/register', (req, res, next) => {
	// 1.接收客户端提交的请求数据
	let uname = req.body.uname
	console.log(uname)
	if (!uname) {
		let output = {
			code: 401,
			msg: 'uname required'
		}
		res.send(output)
		return
	}
	let upwd = req.body.upwd
	if (!upwd) {
		let output = {
			code: 402,
			msg: 'upwd required'
		}
		res.send(output)
		return
	}
	let phone = req.body.phone
	if (!phone) {
		let output = {
			code: 403,
			msg: 'phone required'
		}
		res.send(output)
		return
	}
	let captcha = req.body.captcha
	// console.log("服务器端captcha:", captcha)
	console.log("服务器端captcha:", req.body.captcha)
	console.log("客户端captcha:", req.session.registerCaptcha)
	console.log('session', req.session)
	// console.log("客户端captcha:",captcha.toLowerCase())

	if (!captcha) {
		let output = {
			code: 404,
			msg: 'captcha required'
		}
		res.send(output)
		return
	} else if (captcha.toLowerCase()!== req.session.registerCaptcha) {
		console.log('1',captcha.toLowerCase(),req.session.registerCaptcha)
		console.log('2',captcha.toLowerCase(),req.session)
		let output = {
			code: 405,
			msg: 'captcha error'
		}
		res.send(output)
		return
	}
	
	// 用户输入的验证码验证通过！每个验证码只能使用一次,必须清除服务器端保存的验证码
	delete req.session.registerCaptcha
	// 2.执行数据库插入操作
	let sql1 = 'SELECT uid FROM user WHERE uname=? OR phone=?'
	pool.query(sql1, [uname, phone], (err, result) => {
		if (err) {
			next(err)
			return
		}
		if (result.length > 0) {
			// 查询到相关记录
			let output = {
				code: 400,
				msg: 'uname or phone alredy taken'
			}
			res.send(output)
			return
		}
		// 继续执行
		let sql2 = 'INSERT INTO user(uname,phone,upwd) VALUES(?,?,?)'
		pool.query(sql2, [uname, phone, upwd], (err, result) => {
			if (err) {
				next(err)
				return
			}
			// 3.向客户端输出响应消息
			if (result.affectedRows == 1) {
				let output = {
					code: 200,
					msg: 'Insert the success',
					uid: result.insertId
				}
				console.log(output)
				res.send(output)
			} else {
				let output = {
					code: 404,
					msg: 'Insert the failure'
				}
				res.send(output)
			}
		})

	})
})


/**
 * 1.2	用户登录
接口URL
{{url}}/user/login
请求方式
POST
请求 Content-Type
application/json
请求Body参数
参数	示例值	必填	参数描述
uname	lisi	必填	-用户名
upwd	abc123	必填	-密码
成功响应示例
{
    "code": 200,
    "msg": "login success",
    "UserInfo": {
        "uid": 5,
        "uname": "ranran@tedu.cn",
        "nickname": "然然"    
    }
}

 */
router.post('/login', (req, res, next) => {
	// 1.读取客户端提交的请求数据
	let uname = req.body.uname
	if (!uname) {
		let output = {
			code: 401,
			msg: 'not find uname'
		}
		res.send(output)
	}
	let upwd = req.body.upwd
	if (!upwd) {
		let output = {
			code: 402,
			msg: 'not find upwd'
		}
		res.send(output)
	}
	// 2.执行数据库操作
	let sql = 'SELECT uid,uname FROM user WHERE uname=? AND upwd=?'
	pool.query(sql, [uname, upwd], (err, result) => {
		if (err) {
			next(err)
			return
		}
		console.log(result.length)
		if (result.length > 0) {
			// 3.想客户端输出响应结果
			let output = {
				code: 200,
				msg: "login success",
				UserInfo: result[0]
			}
			res.send(output)
			// 当前客户端保存在服务器上的session空间内存储自己的数据
			req.session.userInfo = result[0]
			req.session.save() //手工保存对session数据的修改
			console.log(result[0])
		} else {
			let output = {
				code: 404,
				msg: 'login failure'
			}
			console.log(output)
			res.send(output)
		}
	})


})

/*
1.3	检测用户名是否存在
接口URL
{{url}}/user/check_uname
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
uname	zhangsan	必填	-用户名
成功响应示例
{
    "code": 200,
    "msg": "exists"
}
失败响应示例
{
    "code": 401,
    "msg": "non-exists"
}

*/
router.get('/check_uname', (req, res, next) => {
	// res.send('this is check_uname...')
	// 1.读取客户端提交的请求数据
	let uname = req.query.uname
	if (!uname) {
		let output = {
			code: 400,
			msg: 'uname required'
		}
		res.send(output)
		return
	}


	// 2.执行数据库查询操作
	let sql = 'SELECT uid FROM USER WHERE uname=?'
	pool.query(sql, uname, (err, result) => {
		// if(err){ throw err}   //正式上线不能使用  error Header
		if (err) {
			next(err) //把所有的错误都交给下一个"错误处理中间件处理"
			return //手工终止当前的路由处理过程
		}

		// 3.向客户端输出相应消息
		if (result.length === 0) {
			let output = {
				code: 401,
				msg: 'non-exsits'
			}
			res.send(output)
		} else {
			let output = {
				code: 200,
				msg: 'exists'
			}
			res.send(output)
		}
	})

})


/*
	1.4	检测手机号是否存在
接口URL
{{url}}/user/check_phone
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
phone	13333333333	必填	-手机号
成功响应示例
{
    "code": 200,
    "msg": "exists"
}
失败响应示例
{
    "code": 402,
    "msg": "non-exists"
}

*/
router.get('/check_phone', (req, res, next) => {
	// res.send('this is check_phone...')
	// 1.读取客户端提交的请求数据
	let phone = req.query.phone
	if (!phone) {
		let output = {
			code: 400,
			msg: 'phone required'
		}
		res.send(output)
		return
	}


	// 2.执行数据库查询操作
	let sql = 'SELECT uid FROM USER WHERE phone=?'
	pool.query(sql, phone, (err, result) => {
		// if(err){ throw err}   //正式上线不能使用  error Header
		if (err) {
			next(err) //把所有的错误都交给下一个"错误处理中间件处理"
			return //手工终止当前的路由处理过程
		}

		// 3.向客户端输出相应消息
		if (result.length === 0) {
			let output = {
				code: 401,
				msg: 'non-exsits'
			}
			res.send(output)
		} else {
			let output = {
				code: 200,
				msg: 'exists'
			}
			res.send(output)
		}
	})

})


/*
1.5	注册用验证码
接口URL
{{url}}/user/register/captcha
请求方式
GET
请求参数
无
成功响应示例
 <svg>...</svg>

同时在服务器端session中保存 captcha.register 字段，值为显示给客户端的随机验证码内容。

*/
const svgCaptcha = require('svg-captcha')
router.get('/register/captcha', (req, res, next) => {
	// 使用第三方模块生成验证码
	let options = {
		size: 4, //随机验证码中字符的个数
		ignoreChars: '0oO1l', //避免出现的字符
		// charPreset:'1234567890',   //预设的字符库,默认为大小写字母+数字
		width: 100, //图片的宽度,默认为150
		height: 38, //图片的高度,默认为50
		fontSize: 30, //字体大小
		noise: 0, //干扰线的数量
		color: true, //字体颜色 默认为false黑白色
		background: '#c1eebd', //验证码图片的背景色
	}
	let captcha = svgCaptcha.create(options)
	console.log(captcha)  //{text:'随机文本',data:'SVG图片内容'}

	// 1.在服务器端会话中存储此时生成的验证码文本
	// req.session.registerCaptcha=captcha.text
	req.session.registerCaptcha = captcha.text.toLowerCase() //保存小写形式的验证内容
	sessionTest = req.session
	console.log("刚刚生成的服务器端验证码:", req.session.registerCaptcha)
	console.log("session:", req.session)
	console.log("刚刚生成的服务器端验证码:", captcha.text)
	req.session.save() //手工保存对session数据的修改
	// 2.向客户端输出此验证码图片的内容
	res.type('svg') //修改Content-type:image/svg+xml
	res.send(captcha.data)
	
	// console.log(captcha.data)
})


/*
	1.6	上传用户头像
	接口URL
	{{url}}/user/upload/avatar
	请求方式
	POST
	请求 Content-Type
	multipart/form-data
	请求主体数据
	参数	示例值	必填	参数描述
	avatar		必填	-二进制图片文件数据
	成功响应示例
	{
	    "code": 200,
	    "msg": "upload succ",
	    "fileName": "/images/avatar/158632317406812345.jpg"
	}

*/
// 使用第三方中间件处理客户端上传的文件/文本域
const multer = require('multer')
const fs = require('fs') //使用Node.js官方提供的fs模块转存文件

let upload = multer({
	dest: './temp/', //destination客户端上传的文件临时存储
})
router.post('/upload/avatar', upload.single('avatar'), (req, res, next) => {
	// console.log('REQ.BODY:',req.body) //客户端提交的文本域
	// console.log('REQ.FILE:',req.file) //客户端提交的文件域
	// 在req.file属性中已经保存在了客户端提交上来的文件信息-保存在临时目录下
	//把临时目录没有后缀的文件转存在另一个有实际意义目录下,
	let oldName = req.file.path //客户端上传到服务器上的文件临时名
	let newName = generateNewFilePath(req.file.originalname) //根据原始文件名生成新的文件名
	fs.rename(oldName, newName, (err) => {
		if (err) {
			next(err)
			return
		}
		let output = {
			code: 200,
			msg: 'upload succ',
			fileName: newName
		}
		res.send(output)
	})
})

function generateNewFilePath(originalFileName) {
	// 生成文件名形如:  ./images/avatar/时间戳+五位的随机数+原文件的后缀名
	let path = './images/avatar/' //目录名称
	path += Date.now() //拼接时间戳
	path += Math.floor(Math.random() * 90000 + 10000) //0-90000+10000 10000到90000的随机数

	let lastDotIndex = originalFileName.lastIndexOf('.') //原文件名中最后一个.的下标
	let extName = originalFileName.substring(lastDotIndex) //原文件中的扩展名部分
	path += extName //文件扩展名
	return path
}

module.exports = router