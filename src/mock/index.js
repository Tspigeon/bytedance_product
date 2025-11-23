// Mock数据配置
import Mock from 'mockjs'

// 设置响应延迟
Mock.setup({
  timeout: '0'
})

// 商品列表mock数据
Mock.mock('/api/products', 'get', {
  'code': 200,
  'data|20': [{
    'id|+1': 1,
    'title|1': ['男装', '女装', '鞋靴', '配饰'],
    'price|100-500': 1,
    'sales|1-9.1-3': 1,
    'tag|1': ['新品', '热销', '折扣'],
    'image': require('../assets/goods.png')
  }],
  'message': 'success'
})

// 商品详情mock数据
Mock.mock(/\/api\/products\/\d+/, 'get', {
  'code': 200,
  'data': {
    'id': 1,
    'title|1': ['男装', '女装', '鞋靴', '配饰'],
    'price': '@integer(100, 500)',
    'description': '这是是商品详情介绍',
    'sizes': ['S', 'M', 'L', 'XL'],
    'colors': ['黑', '白', '蓝'],
    'stock|50-200': 1,
    'images|5': [require('../assets/goods.png')],
    'details': '@cparagraph(5, 10)'
  },
  'message': 'success'
})

// 推荐商品mock数据
Mock.mock(/\/api\/products\/recommended/, 'get', {
  'code': 200,
  'data|6': [{
    'id|+1': 100,
    'title|1': ['男装', '女装', '鞋靴', '配饰'],
    'price|100-400': 1,
    'image': require('../assets/goods.png')
  }],
  'message': 'success'
})

export default Mock