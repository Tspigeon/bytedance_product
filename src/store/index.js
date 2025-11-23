import { defineStore } from 'pinia'
import axios from 'axios'

// 商品相关的store
export const goodsStore = defineStore('goods', {
  state: () => ({
    // 商品列表相关状态
    products: [],
    total: 0,
    loading: false,
    
    // 商品详情相关状态
    productDetail: null,
    currentProductId: null,
    
    // 推荐商品相关状态
    recommendedProducts: []
  }),
  
  getters: {
    // 获取所有商品
    allProducts: (state) => state.products,
    
    // 根据ID获取商品
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === id) || state.productDetail;
    },
    
    // 获取推荐商品
    allRecommendedProducts: (state) => state.recommendedProducts
  },
  
  actions: {
    // 获取商品列表
    async fetchProducts() {
      this.loading = true;
      try {
        console.log('开始请求商品列表');
        // 使用axios替代fetch请求
        const response = await axios.get('/api/products', {
          headers: {
            'Content-Type': 'application/json'
          },
          // 避免发送跨域凭证，减少请求头大小
          withCredentials: false
        });
        
        console.log('响应:', response);
        
        // axios会自动处理JSON解析，直接获取数据
        const result = response.data;
        console.log('获取商品列表响应:', result);
        
        // 检查响应结构
        if (result && result.code === 200 && result.data) {
          this.products = result.data;
          this.total = result.data.length;
          return result.data;
        } else {
          console.error('响应结构不正确:', result);
          return this.getMockProducts();
        }
      } catch (error) {
        console.error('请求商品列表出错:', error);
        // 处理各种错误情况
        if (error.response) {
          // 服务器返回错误状态码
          console.error('HTTP错误:', error.response.status, error.response.statusText);
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error('网络错误，未收到响应');
        } else {
          // 请求配置出错
          console.error('请求配置错误:', error.message);
        }
        return this.getMockProducts();
      } finally {
        this.loading = false;
      }
    },
    
    // 提供模拟商品数据作为备用
    getMockProducts() {
      const mockData = Array.from({length: 20}, (_, i) => ({
        id: i + 1,
        title: `商品${i + 1}`,
        price: Math.floor(Math.random() * 1000) + 100,
        image: require('../assets/goods.png'),
        tag: ['新品', '热销', '折扣'][Math.floor(Math.random() * 3)],
        sales: parseFloat((Math.random() * 8 + 1).toFixed(2))
      }));
      this.products = mockData;
      this.total = mockData.length;
      console.log('使用模拟商品数据');
      return mockData;
    },
    
    // 获取商品详情
    async fetchProductDetail(productId) {
      this.loading = true;
      try {
        // 如果已有该商品的详情，直接返回
        if (this.currentProductId === productId && this.productDetail) {
          return this.productDetail;
        }
        
        console.log(`开始请求商品详情，ID: ${productId}`);
        // 使用axios替代fetch请求
        const response = await axios.get(`/api/products/${productId}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          // 避免发送跨域凭证，减少请求头大小
          withCredentials: false
        });
        
        console.log('响应:', response);
        
        // axios会自动处理JSON解析，直接获取数据
        const result = response.data;
        console.log('获取商品详情响应:', result);
        
        // 检查响应结构
        if (result && result.code === 200 && result.data) {
          this.productDetail = result.data;
          this.currentProductId = productId;
          return result.data;
        } else {
          console.error('响应结构不正确:', result);
          return this.getMockProductDetail(productId);
        }
      } catch (error) {
        console.error('请求商品详情出错:', error);
        // 处理各种错误情况
        if (error.response) {
          // 服务器返回错误状态码
          console.error('HTTP错误:', error.response.status, error.response.statusText);
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error('网络错误，未收到响应');
        } else {
          // 请求配置出错
          console.error('请求配置错误:', error.message);
        }
        return this.getMockProductDetail(productId);
      } finally {
        this.loading = false;
      }
    },
    
    // 提供模拟商品详情数据作为备用
    getMockProductDetail(productId) {
      const mockDetail = {
        id: parseInt(productId) || 1,
        title: `商品${productId}详情`,
        price: Math.floor(Math.random() * 1000) + 100,
        description: `这是商品${productId}的详细描述，包含了商品的各种特性和优势。`,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['黑', '白', '蓝'],
        stock: Math.floor(Math.random() * 150) + 50,
        images: Array.from({length: 5}, () => require('../assets/goods.png')),
        details: `商品${productId}的详细介绍内容。\n\n这款商品采用优质材料制作，具有良好的耐用性和美观性。\n\n适合各种场合使用，是您日常生活的理想选择。\n\n我们提供完善的售后服务，让您购物无忧。`
      };
      this.productDetail = mockDetail;
      this.currentProductId = productId;
      console.log('使用模拟商品详情数据');
      return mockDetail;
    },
    
    // 获取推荐商品
    async fetchRecommendedProducts() {
      this.loading = true;
      try {
        // 如果已有推荐商品，直接返回
        if (this.recommendedProducts.length > 0) {
          return this.recommendedProducts;
        }
        
        console.log('开始请求推荐商品列表');
        // 使用axios替代fetch请求
        const response = await axios.get('/api/products/recommended', {
          headers: {
            'Content-Type': 'application/json'
          },
          // 避免发送跨域凭证，减少请求头大小
          withCredentials: false
        });
        
        console.log('响应:', response);
        
        // axios会自动处理JSON解析，直接获取数据
        const result = response.data;
        console.log('获取推荐商品列表响应:', result);
        
        // 检查响应结构
        if (result && result.code === 200 && result.data) {
          this.recommendedProducts = result.data;
          console.log('推荐商品列表更新成功，数量:', this.recommendedProducts.length);
          return result.data;
        } else {
          console.error('响应结构不正确:', result);
          return this.getMockRecommendedProducts();
        }
      } catch (error) {
        console.error('获取推荐商品列表时出错:', error);
        // 处理各种错误情况
        if (error.response) {
          // 服务器返回错误状态码
          console.error('HTTP错误:', error.response.status, error.response.statusText);
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error('网络错误，未收到响应');
        } else {
          // 请求配置出错
          console.error('请求配置错误:', error.message);
        }
        return this.getMockRecommendedProducts();
      } finally {
        this.loading = false;
      }
    },
    
    // 提供模拟推荐商品数据作为备用
    getMockRecommendedProducts() {
      const mockData = Array.from({length: 6}, (_, i) => ({
        id: 100 + i,
        title: `推荐商品${i + 1}`,
        price: Math.floor(Math.random() * 400) + 100,
        image: require('../assets/goods.png')
      }));
      this.recommendedProducts = mockData;
      console.log('使用模拟推荐商品数据');
      return mockData;
    }
  }
});

// 购物车相关的store
export const cartStore = defineStore('cart', {
  state: () => ({
    cartItems: [],
    cartDrawerVisible: false
  }),
  
  getters: {
    // 获取购物车所有商品
    allCartItems: (state) => state.cartItems,
    
    // 计算购物车商品总数
    cartItemCount: (state) => {
      return state.cartItems.reduce((count, item) => count + item.quantity, 0);
    },
    
    // 计算购物车总价
    totalPrice: (state) => {
      return state.cartItems.reduce((total, item) => {
        return total + (item.price || 0) * (item.quantity || 0);
      }, 0);
    },
    
    // 获取购物车抽屉可见状态
    isCartDrawerVisible: (state) => state.cartDrawerVisible
  },
  
  actions: {
    // 添加商品到购物车
    addToCart(product) {
      // 检查是否已存在相同商品（相同ID、尺码和颜色）
      const existingItemIndex = this.cartItems.findIndex(item => 
        item.id === product.id && 
        item.size === product.size && 
        item.color === product.color
      );
      
      if (existingItemIndex > -1) {
        // 如果已存在，增加数量
        this.cartItems[existingItemIndex].quantity += product.quantity;
      } else {
        // 否则添加新商品
        this.cartItems.push({
          id: product.id,
          title: product.title,
          size: product.size,
          color: product.color,
          price: product.price,
          quantity: product.quantity
        });
      }
      
      // 显示购物车抽屉
      this.cartDrawerVisible = true;
    },
    
    // 从购物车移除商品
    removeFromCart(index) {
      if (index >= 0 && index < this.cartItems.length) {
        this.cartItems.splice(index, 1);
      }
    },
    
    // 清空购物车
    clearCart() {
      this.cartItems = [];
    },
    
    // 切换购物车抽屉可见状态
    toggleCartDrawer() {
      this.cartDrawerVisible = !this.cartDrawerVisible;
    },
    
    // 设置购物车抽屉可见状态
    setCartDrawerVisible(visible) {
      this.cartDrawerVisible = visible;
    }
  }
});