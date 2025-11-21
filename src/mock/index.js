// Mock数据配置
import Mock from 'mockjs'

// 设置响应延迟
Mock.setup({
  timeout: '200-600'
})

// 商品列表mock数据
Mock.mock('/api/products', 'get', {
  'code': 200,
  'data|20': [{
    'id|+1': 1,
    'title': '@ctitle(10, 20)',
    'price|100-500': 1,
    'sales|1-9.1-3': 1,
    'tag|1': ['新品', '热销', '折扣'],
    'image': '@image("300x300", "#409eff", "商品图片")'
  }],
  'message': 'success'
})

// 商品详情mock数据
Mock.mock(/\/api\/products\/\d+/, 'get', {
  'code': 200,
  'data': {
    'id': 1,
    'title': '@ctitle(10, 20)',
    'price': '@integer(100, 500)',
    'description': '@cparagraph(3, 5)',
    'sizes': ['S', 'M', 'L', 'XL'],
    'colors': ['黑', '白', '蓝'],
    'stock|50-200': 1,
    'images|5': ['@image("800x800", "#409eff", "商品主图")'],
    'details': '@cparagraph(5, 10)'
  },
  'message': 'success'
})

// 推荐商品mock数据
Mock.mock(/\/api\/products\/recommended/, 'get', {
  'code': 200,
  'data|6': [{
    'id|+1': 100,
    'title': '@ctitle(10, 15)',
    'price|100-400': 1,
    'image': '@image("300x300", "#67c23a", "推荐商品")'
  }],
  'message': 'success'
})

export default Mock