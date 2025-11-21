import { defineStore } from 'pinia'

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
        const response = await fetch('/api/products');
        const result = await response.json();
        console.log('获取商品列表响应:', result);
        
        if (result.code === 200) {
          this.products = result.data;
          this.total = result.data.length;
          return result.data;
        } else {
          console.error('获取商品列表失败');
          return [];
        }
      } catch (error) {
        console.error('请求商品列表出错:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // 获取商品详情
    async fetchProductDetail(productId) {
      this.loading = true;
      try {
        // 如果已有该商品的详情，直接返回
        if (this.currentProductId === productId && this.productDetail) {
          return this.productDetail;
        }
        
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();
        
        if (result.code === 200) {
          this.productDetail = result.data;
          this.currentProductId = productId;
          return result.data;
        } else {
          console.error('获取商品详情失败');
          return null;
        }
      } catch (error) {
        console.error('请求商品详情出错:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取推荐商品
    async fetchRecommendedProducts() {
      try {
        // 如果已有推荐商品，直接返回
        if (this.recommendedProducts.length > 0) {
          return this.recommendedProducts;
        }
        
        const response = await fetch('/api/products/recommended');
        const result = await response.json();
        
        if (result.code === 200) {
          this.recommendedProducts = result.data;
          return result.data;
        } else {
          console.error('获取推荐商品失败');
          return [];
        }
      } catch (error) {
        console.error('请求推荐商品出错:', error);
        return [];
      }
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