import { readFileSync } from 'fs';
import { isNotEmptyString } from '../utils/is'

const auth = async (req, res, next) => { 

  try {
    const Authorization = req.header('Authorization')
    // 读取已有用户信息
    const data = JSON.parse(readFileSync('data/users.json', 'utf-8'));
    let users = Authorization.split("&");
    // 查找匹配的用户
    const user = data.users.find(user => user.username === users[0].split(' ')[1] && user.password === users[1]);
    if (!user) {
      throw new Error('Error: 无访问权限 | No access rights')
      next()
    } else {
      next()
    }

  }
  catch (error) {
    res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
  }




  //  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY

  // if (isNotEmptyString(AUTH_SECRET_KEY)) {
  //   try {
  //     const Authorization = req.header('Authorization')
  //     if (!Authorization || Authorization.replace('Bearer ', '').trim() !== AUTH_SECRET_KEY.trim())
  //       throw new Error('Error: 无访问权限 | No access rights')
  //     next()
  //   }
  //   catch (error) {
  //     res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
  //   }
  // }
  // else {
  //   next()
  // }
}

export { auth }
