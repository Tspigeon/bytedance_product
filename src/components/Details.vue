<template>
  <div class="product-details-container">
    <!-- 标题 -->
    <h1 class="page-title">商品详情</h1>
    <!-- 导航栏 -->
    <el-input
      v-model="navSearch"
      placeholder="搜索商品..."
      class="nav-input"
      @input="handleSearch"
      clearable
      prefix-icon="el-icon-search"
    />
    
    <div class="main-content">
      <!-- 商品信息主区域 -->
      <div class="product-main-section">
        <!-- 左侧主图区域 -->
            <div class="image-section">
              <div v-if="loading">
                <el-skeleton :rows="1" animated />
              </div>
              <div v-else-if="productDetail">
                <div class="main-image">
                  <img :src="images[currentThumbIndex]" :alt="productDetail.title" v-if="images[currentThumbIndex]" />
                  <span v-else>主图轮播区</span>
                </div>
                <div class="thumbnail-list">
                    <div 
                      v-for="(image, index) in images" 
                      :key="index"
                      class="thumbnail"
                      :class="{ active: currentThumbIndex === index }"
                      @click="handleThumbClick(index)"
                    >
                      <img :src="image" :alt="`缩略图${index+1}`" v-if="image" />
                      <span v-else>缩略图{{index+1}}</span>
                    </div>
                </div>
              </div>
            </div>
        <!-- 右侧信息与规格选择区 -->
            <div class="info-section">
              <div v-if="loading">
                <el-skeleton :rows="4" animated />
              </div>
              <div v-else-if="productDetail">
                <div class="product-header">
                  <h2 class="product-title">{{ $route.query.title || 商品名 }}</h2>
                  <div class="product-price">价格：¥{{ $route.query.price || 0 }}</div>
                  <div class="product-description">{{ productDetail.description || 'xxxx' }}</div>
                </div>
          <div class="spec-section">
            <!-- 尺码选择 -->
            <div class="spec-group">
              <label class="spec-label">尺码</label>
              <el-radio-group v-model="selectedSize" class="size-options">
                <el-radio-button v-for="size in sizes" :key="size" :label="size">{{ size }}</el-radio-button>
              </el-radio-group>
            </div>
            <!-- 颜色选择 -->
            <div class="spec-group">
              <label class="spec-label">颜色</label>
              <el-radio-group v-model="selectedColor" class="color-options">
                <el-radio-button v-for="color in colors" :key="color" :label="color">{{ color }}</el-radio-button>
              </el-radio-group>
            </div>
            <!-- 库存信息 -->
            <div class="stock-info">
              库存：根据您选择的尺码和颜色显示可用数量；无库存时禁用加入购物车。
            </div>
          </div>
          <div class="cart-section">
            <div class="add-to-cart-group">
              <span class="cart-label">加入购物车：</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="stockQuantity"
                class="quantity-input"
              />
              <el-button 
                type="primary" 
                @click="addToCart"
                :disabled="!hasStock"
                class="add-cart-btn"
              >加入购物车</el-button>
            </div>
            <div class="cart-tip">
              购物车提示：加入后从右侧滑出，展示购物车列表与结算按钮。</div>
          </div>
        </div>
        </div>
      </div>
      <!-- 推荐/相似商品区域 -->
      <div class="recommended-section">
        <h3 class="section-title">推荐/相似商品</h3>
        <div class="recommended-products">
            <div v-if="loading">
              <el-skeleton :rows="6" animated />
            </div>
            <div v-else class="recommended-products-grid">
              <div class="recommended-card" v-for="product in recommendedProducts" :key="product.id">
                <div class="rec-product-image">
                  <img :src="product.image" :alt="product.title" v-if="product.image" />
                  <span v-else>暂无图片</span>
                </div>
                <div class="rec-product-title">{{ product.title }}</div>
                <div class="rec-product-price">¥{{ product.price }}</div>
              </div>
            </div>
        </div>
      </div>
    </div>
    <!-- 购物车抽屉（预留接口） -->
    <el-drawer
      v-model="cartDrawerVisible"
      direction="rtl"
      title="购物车"
      size="400px"
      @close="setCartDrawerVisible(false)"
    >
      <div class="cart-drawer-content">
        <div v-if="cartItems.length === 0" class="empty-cart">
          购物车为空
        </div>
        <div v-else class="cart-items">
          <div class="cart-item" v-for="(item, index) in cartItems" :key="index">
            <div class="item-info">{{ item.title }} - {{ item.size }} - {{ item.color }}</div>
            <div class="item-price">¥{{ (item.price || 0) }} x {{ (item.quantity || 0) }}</div>
          </div>
          <div class="cart-summary">
            <div class="total-price">总价：¥{{ totalPrice }}</div>
            <el-button type="primary" class="checkout-btn">结算</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { debounce, throttle } from '../utils/debounceThrottle';

export default {
  name: 'ProductDetails',
  data() {
    return {
      navSearch: '',
      searchKeyword: '',
      currentThumbIndex: 0,
      productDetail: null,
      images: [],
      sizes: [],
      colors: [],
      selectedSize: '',
      selectedColor: '',
      quantity: 1,
      stockQuantity: 0,
      recommendedProducts: [],
      cartDrawerVisible: false,
      cartItems: [],
      loading: false
    }
  },
  created() {
    // 组件创建时获取商品详情和推荐商品
    this.fetchProductDetail();
    this.fetchRecommendedProducts();
  }, 
  
  methods: {
        // 防抖搜索处理
        handleSearch: debounce(function() {
          this.searchKeyword = this.navSearch;
          // 如果有搜索关键词，跳转到搜索结果页
          if (this.searchKeyword.trim()) {
            this.$router.push({
              path: '/',
              query: { search: this.searchKeyword }
            });
          }
        }, 500),
        
        // 处理缩略图点击，使用节流避免频繁切换
        handleThumbClick: throttle(function(index) {
          this.currentThumbIndex = index;
        }, 100),
        
        // 关闭购物车抽屉
        setCartDrawerVisible(value) {
        this.cartDrawerVisible = value;
        },
        // 获取商品详情
        async fetchProductDetail() {
        // 在方法内部导入store，确保Pinia已初始化
        let store;
        try {
            const { goodsStore } = await import('../store');
            store = goodsStore();
        } catch (error) {
            console.warn('未找到或无法导入store，使用本地数据获取:', error);
        }
        
        this.loading = true;
          try {
              // 使用query参数中的商品ID
              const productId = this.$route.query.id;
              
              if (store && store.fetchProductDetail) {
                const detail = await store.fetchProductDetail(productId);
                this.productDetail = detail;
                // 使用props中的title覆盖详情中的title
                this.images = detail.images || [];
                this.sizes = detail.sizes || [];
                this.colors = detail.colors || [];
                this.stockQuantity = detail.stock || 0;
            } else {
                // 回退到直接API调用
                const response = await fetch(`/api/products/${productId}`);
                const result = await response.json();
                
                if (result.code === 200) {
                this.productDetail = result.data;
                // 使用props中的title覆盖详情中的title
                this.images = result.data.images || [];
                this.sizes = result.data.sizes || [];
                this.colors = result.data.colors || [];
                this.stockQuantity = result.data.stock || 0;
                }
            }
            
            // 设置默认选中值
            if (this.sizes.length > 0) {
                this.selectedSize = this.sizes[0];
            }
            if (this.colors.length > 0) {
                this.selectedColor = this.colors[0];
            }
        } catch (error) {
            console.error('请求商品详情出错:', error);
            this.$message.error('网络错误，请稍后重试');
        } finally {
            this.loading = false;
        }
        },
        // 获取推荐商品
        async fetchRecommendedProducts() {
        // 在方法内部导入store，确保Pinia已初始化
        let store;
        try {
            const { goodsStore } = await import('../store');
            store = goodsStore();
        } catch (error) {
            console.warn('未找到或无法导入store，使用本地数据获取:', error);
        }
        
        try {
            // 如果store可用，尝试使用store获取数据
            if (store && store.fetchRecommendedProducts) {
                const recommended = await store.fetchRecommendedProducts();
                this.recommendedProducts = recommended;
            } else {
                // 回退到直接API调用
                const response = await fetch('/api/products/recommended');
                const result = await response.json();
                
                if (result.code === 200) {
                this.recommendedProducts = result.data;
                } else {
                this.$message.error('获取推荐商品失败');
                }
            }
        } catch (error) {
            console.error('请求推荐商品出错:', error);
        }
        },
        // 添加到购物车 
        async addToCart() {
        if (this.hasStock && this.quantity <= this.stockQuantity && this.productDetail) {
            // 在方法内部导入store，确保Pinia已初始化
            let store;
            try {
                const { cartStore } = await import('../store');
                store = cartStore();
            } catch (error) {
                console.warn('未找到或无法导入cartStore，使用本地购物车:', error);
            }
            
            const product = {
            title: this.productDetail.title,
            size: this.selectedSize,
            color: this.selectedColor,
            price: this.productDetail.price,
            quantity: this.quantity
            };
            
            // 如果store可用，使用store管理购物车
            if (store && store.addToCart) {
                store.addToCart(product);
                // 如果store有设置购物车抽屉可见性的方法，使用它
                if (store.setCartDrawerVisible) {
                store.setCartDrawerVisible(true);
                }
            } else {
                // 回退到本地购物车实现
                this.cartItems.push(product);
                this.cartDrawerVisible = true;
            }
            
            // 显示成功提示
            this.$message.success('已成功加入购物车');
        } else {
            this.$message.error('库存不足');
        }
        }
    },
    computed: {
        hasStock() {
            return this.stockQuantity > 0;
        },
        totalPrice() {
            return this.cartItems.reduce((total, item) => {
                return total + (item.price || 0) * (item.quantity || 0);
            }, 0);
        }
    }
}
</script>

<style scoped>
.product-details-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.nav-input {
  width: 100%;
  margin-bottom: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.product-main-section {
  display: flex;
  gap: 40px;
}

.image-section {
  width: 50%;
  display: flex;
  flex-direction: column;
}

.main-image {
  width: 100%;
  height: 250px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.thumbnail {
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumbnail:hover {
  border-color: #409eff;
}

.thumbnail.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.info-section {
  width: 50%;
}

.product-header {
  margin-bottom: 30px;
}

.product-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 15px;
  line-height: 1.4;
  height: 56px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 24px;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 10px;
}

.spec-section {
  margin-bottom: 30px;
}

.spec-group {
  margin-bottom: 20px;
}

.spec-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
}

.size-options,
.color-options {
  display: flex;
  gap: 10px;
}

.stock-info {
  font-size: 14px;
  color: #606266;
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.cart-section {
  padding: 20px 0;
  border-top: 1px solid #e0e0e0;
}

.add-to-cart-group {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.cart-label {
  font-size: 16px;
  font-weight: 500;
}

.quantity-input {
  width: 120px;
}

.add-cart-btn {
  padding: 12px 30px;
  font-size: 16px;
}

.cart-tip {
  font-size: 14px;
  color: #909399;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.recommended-section {
  margin-top: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.recommended-products {
  width: 100%;
}

.recommended-products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.product-description {
  font-size: 14px;
  color: #606266;
  margin-top: 10px;
  line-height: 1.6;
}

.recommended-card {
  text-align: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
}

.recommended-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.rec-product-image {
  width: 100%;
  height: 75px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border-radius: 4px;
}

.rec-product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.rec-product-title {
  font-size: 14px;
  margin-bottom: 8px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.rec-product-price {
  font-size: 16px;
  font-weight: 500;
  color: #ff4d4f;
}

/* 购物车抽屉样式 */
.cart-drawer-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-cart {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
}

.cart-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 20px;
  text-align: right;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .product-main-section {
    flex-direction: column;
  }
  
  .image-section,
  .info-section {
    width: 100%;
  }
  
  .recommended-products {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>