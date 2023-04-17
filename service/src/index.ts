import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import fs from 'fs'
import { readFileSync } from 'fs';
import { generateToken, getUserInfo } from './utils/token' 
 
const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    const user: any = getUserInfo(req.header('Authorization').replace('Bearer ', '').trim());
    const username = user?.username
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
      username

    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    // const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    // const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    const hasAuth = true;//JSON.parse(process.env.AUTH_SECRET_KEY).length > 0
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')
    let tokens = JSON.parse(process.env.AUTH_SECRET_KEY);
    let bright: boolean = false;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] == token) {
        bright = true;
        break;
      }
    }
    if (!bright) {
      throw new Error('密钥无效 | Secret key is invalid')
    } else {
      return res.send({ status: 'Success', message: 'Verify successfully', data: null })
    }
    // if (process.env.AUTH_SECRET_KEY !== token)
    //   throw new Error('密钥无效 | Secret key is invalid')

    // res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})


router.post('/register', (req, res) => {

  // 从请求体中获取用户名和密码
  const { username, password, name, tel } = req.body;

  // 读取已有用户信息
  const data = JSON.parse(readFileSync('data/users.json', 'utf-8'));

  // 判断用户名是否存在
  const userExists = data.users.find(user => user.username === username);

  if (userExists) {
    // res.status(409).send('This username is already taken');
    res.send({ status: 'Fail', message: 'This username is already taken', data: null })
  } else {
    // 创建新的用户对象
    const newUser = {
      id: data.users.length + 1,
      username,
      password,
      name,
      tel
    };

    // 添加新用户
    data.users.push(newUser);
    fs.writeFileSync('data/users.json', JSON.stringify(data));

    // 返回新用户信息
    res.send({ status: 'Success', message: 'reg successfully', data: null })
    // res.status(201).send(newUser);
  }
});


router.post('/login', (req, res) => {
  // 从请求体中获取用户名和密码
  const { username, password } = req.body;

  // 读取已有用户信息
  const data = JSON.parse(readFileSync('data/users.json', 'utf-8'));

  // 查找匹配的用户
  const user = data.users.find(user => user.username === username && user.password === password);

  if (user) {
    // 返回用户信息
    //res.send(user);
    let token = generateToken(user, req); // 调用生成token的函数，传入用户信息
    res.send({ status: 'Success', message: 'login successfully', data: null, token })
  } else {
    res.send({ status: 'Fail', message: 'Invalid username or password', data: null })
    // res.status(401).send('Invalid username or password');
  }
});

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(10000, () => globalThis.console.log('Server is running on port 10000'))
