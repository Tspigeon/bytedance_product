<template>
  <div class="product-list-container">
    <!-- 标题 -->
    <h1 class="page-title">字节商城</h1>
    
    <!-- 导航栏 -->
    <el-input
      v-model="navSearch"
      placeholder="导航栏"
      class="nav-input"
    />
    
    <div class="main-content">
      <!-- 左侧筛选区 -->
      <div class="filter-section">
        <h3>筛选区</h3>
        
        <!-- 分类 -->
        <div class="filter-group">
          <h4>分类</h4>
          <el-tree
            :data="categoryData"
            :props="defaultProps"
            class="category-tree"
          />
        </div>
        
        <!-- 价格区间 -->
        <div class="filter-group">
          <h4>价格区间</h4>
          <div class="price-range">
            <el-input-number
              v-model="minPrice"
              placeholder="最低价"
              :min="0"
              class="price-input"
            />
            <span class="price-separator">-</span>
            <el-input-number
              v-model="maxPrice"
              placeholder="最高价"
              :min="0"
              class="price-input"
            />
          </div>
        </div>
      </div>
      
      <!-- 右侧商品展示区 -->
      <div class="product-section">
        <!-- 排序选项 -->
        <div class="sort-options">
          <span>排序:</span>
          <el-radio-group v-model="sortBy" size="small">
            <el-radio-button label="price_asc">价格 ↑</el-radio-button>
            <el-radio-button label="price_desc">价格 ↓</el-radio-button>
            <el-radio-button label="sales">销量</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 商品网格 -->
        <div class="product-grid">
          <router-link :to="'/details/' + product.id" class="product-link" v-for="product in products" :key="product.id">
            <div class="product-card">
              <div class="product-image">{{ product.image }}</div>
              <div class="product-info">
                <div class="product-title">{{ product.title }}</div>
                <div class="product-price">价格 ¥{{ product.price }}</div>
                <div class="product-sales">销量 {{ product.sales }}</div>
                <el-tag :type="getTagType(product.tag)" class="product-tag">{{ product.tag }}</el-tag>
              </div>
            </div>
          </router-link>
        </div>
        
        <!-- 空状态 -->
        <el-empty
          v-if="products.length === 0 && !loading"
          description="无符合条件的商品"
          class="empty-state"
        />
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="6" animated />
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            layout="prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
            :loading="loading"
          />
          <span class="page-size-info">每页数量: 12</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeskTop',
  data() {
    return {
      navSearch: '',
      sortBy: 'price_asc',
      minPrice: null,
      maxPrice: null,
      categoryData: [
        { label: '男装', children: [] },
        { label: '女装', children: [] },
        { label: '鞋靴', children: [] },
        { label: '配饰', children: [] }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      internalProducts: [],
      internalLoading: false,
      internalTotal: 0,
      currentPage: 1,
      pageSize: 12
    }
  },
  computed: {
    // 使用本地状态
    products: {
      get() {
        return this.internalProducts || [];
      },
      set(value) {
        this.internalProducts = value;
      }
    },
    loading: {
      get() {
        return this.internalLoading || false;
      },
      set(value) {
        this.internalLoading = value;
      }
    },
    total: {
      get() {
        return this.internalTotal || 0;
      },
      set(value) {
        this.internalTotal = value;
      }
    }
  },
  created() {
    // 组件创建时从store获取商品列表
    this.getProductsFromStore();
  },
  methods: {
    // 从store获取商品列表
    async getProductsFromStore() {
      // 在方法内部导入store，确保Pinia已初始化
      const { goodsStore } = await import('../store');
      const store = goodsStore();
      try {
        await store.fetchProducts();
        // 更新本地状态
      this.products = store.products;
      this.loading = store.loading;
      this.total = store.total;
      } catch (error) {
        this.$message.error('获取商品列表失败');
      }
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
    },
    getTagType(tag) {
      switch(tag) {
        case '新品': return 'primary'
        case '热销': return 'success'
        case '折扣': return 'warning'
        default: return 'info'
      }
    }
  }
}
</script>

<style scoped>
.product-list-container {
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
  gap: 20px;
}

.filter-section {
  width: 240px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group h4 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.category-tree {
  background: transparent;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input {
  width: 80px;
}

.price-separator {
  font-size: 16px;
}

.product-section {
  flex: 1;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

/* 移除router-link的下划线 */
.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.product-card {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
}

.product-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #999;
}

.product-title {
  font-size: 14px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 40px;
}

.product-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 4px;
}

.product-sales {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.product-tag {
  margin-top: 8px;
}

.empty-state {
  padding: 60px 0;
  margin: 20px 0;
  background: #fafafa;
  border-radius: 8px;
}

.loading-state {
  padding: 40px 0;
  margin: 20px 0;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e6e6e6;
}

.page-size-info {
  color: #606266;
  font-size: 14px;
}
</style>