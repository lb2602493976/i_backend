/*登录检查中间将:如果客户端尚未登录(即req.session.userInfo不存在),
则输出一个相应消息,并结束请求处理过程否则,在req中添加一个新的属性:
req.uid,公后续请求处理路由使用
*/
module.exports=(req,res,next)=>{
	if(!req.session){		
		let output = {
			code: 599,
			msg: 'Server Err:session middleware required'
		}
		res.send(output)
		return
	}
	if(!req.session.userInfo){		//当前用户尚未登录
		let output = {
			code: 499,
			msg: 'login required'
		}
		res.send(output)
		return
	}
	// 如果客户端已经完成登录了
	req.uid=req.session.userInfo.uid
	next()   //中间件检查之后放行,继续执行后续的中间件或路由
}
