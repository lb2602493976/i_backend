const mysql = require("mysql");
// 创建连接池对象
let pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "iweb",
  connectionLimit: 15,
  // // 新浪云上线需要
  // host: process.env.MYSQL_HOST, //域名
  // port: process.env.MYSQL_PORT, //端口
  // user: process.env.ACCESSKEY, //管理员名称
  // password: process.env.SECRETKEY, //密码
  // database: "app_" + process.env.APPNAME, //数据库名
  // connectionLimit: 15, //连接池大小
});
// console.log(pool)  输出pool无法验证数据库连接是否成功
pool.query('SELECT 1+2',(err,result)=>{
	if(err){
		throw err
	}
	console.log(result)
})
// 导出连接池
module.exports = pool;
