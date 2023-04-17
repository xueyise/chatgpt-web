import { verifyToken } from '../utils/token'
const auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization; // 获取请求头中的authorization字段，即携带的token
    let result = verifyToken(token, req); // 调用验证token的函数，传入token    
    if (!result) {
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
