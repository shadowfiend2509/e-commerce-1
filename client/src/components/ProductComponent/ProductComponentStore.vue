<template>
<div>
  <div class="container page-wrapper">
  <div class="page-inner">
    <div class="row">
      <div class="el-wrapper">
        <div class="box-up">
          <img class="img" :src="getProduct.product_image" alt="">
          <div class="img-info">
            <div class="info-inner">
              <span class="p-name">{{ getProduct.name }}</span>
              <span class="p-company">{{ getProduct.StoreId.name }}</span>
            </div>
            <div class="a-size">Available Stock: <span class="size">{{ getProduct.stock }}</span> <br>
                <div class='LoopC'>
                <div v-for='(category, i) in getProduct.category' :key='i'>
                  <b-badge pill variant="light" class='badgec2'> {{ category }} </b-badge></div>
                </div>
              </div>
          </div>
        </div>

        <div class="box-down">
          <div class="h-bg">
            <div class="h-bg-inner"></div>
          </div>

          <a class="cart" href="#">
            <span class="price">{{ price }}</span>
            <span class="add-to-cart d-flex">
              <b-button v-b-modal.modal-lg variant="primary" @click='getAllChange(getProduct)'>edit</b-button>
              <!-- <span class="txt" @click='updateStock' v-if='!restock'>Update Stock</span>
              <div v-else>
                <input type='number' v-model='stock'>
                <span class="txt" @click='reStock(getProduct._id)' v-if='restock'>Save</span>
              </div> -->


              <button class="btn-sm btn-outline-danger btn ml-4" @click='deleteProduct(getProduct._id)'>delete</button>
            </span>
              <b-modal id="modal-lg" size="lg" title="Large Modal"  @ok='updateProduct(getProduct._id)'>
                <div class="divTable">
                  <table>
                    <tr>
                      <td>
                        <label>Product Name</label>
                      </td>
                      <td>
                        <input type="text" v-model='newName' placeholder="product name">
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Description</label>
                      </td>
                      <td>
                        <input type="text" v-model='newDescription' placeholder="description">
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Price</label>
                      </td>
                      <td>
                        <input type="number" v-model='newPrice' placeholder="00000">
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Stock</label>
                      </td>
                      <td>
                        <input type="number" v-model='newStock' placeholder="00">
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Category</label>
                      </td>
                      <td>
                        <input-tag v-model="newTags" style='font-size: 20px;'></input-tag>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Condition</label>
                      </td>
                      <td>
                        <select v-model='newCondition'>
                          <option value='new'>New</option>
                          <option value="second">Second</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Product Image</label>
                      </td>
                      <td>
                        <b-form-file
                          ref="file"
                          type="file"
                          name='file'
                          v-model="file"
                          :state="Boolean(file)"
                          placeholder="Choose a file or drop it here..."
                          drop-placeholder="Drop file here..."
                        ></b-form-file>
                      </td>
                    </tr>
                  </table>
                </div>
              </b-modal>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
</template>

<script>
import axios from '@/apis/server.js'

export default {
  data () {
    return {
      isWish: false,
      newStock: null,
      file: null,
      newTags: [],
      newPrice: null,
      newName: null,
      newDescription: null,
      newCondition: null
    }
  },
  props: ['getProduct'],
  watch: {
    getProduct (val) {
      this.getProduct = val
    }
  },
  methods: {
    getAllChange (data) {
      this.newStock = data.stock;
      this.newTags = data.category
      this.newPrice = data.price;
      this.newName = data.name;
      this.newDescription = data.description;
      this.newCondition = data.condition;
    },
    updateProduct (id) {
      let formData = new FormData()
      formData.append('image', this.file)
      formData.append('name', this.newName)
      formData.append('description', this.newDescription)
      formData.append('stock', this.newStock)
      formData.append('price', this.newPrice)
      formData.append('condition', this.newCondition)
      formData.append('category', this.newTags)
      this.$awn.asyncBlock(
        this.updateAction(id, formData),
        null,
        null,
        'Updating'
      )
        .then(() => {
          this.$store.dispatch('checkSignIn')
        })
        .catch(err => {
          this.$awn.warning(err.response.data.msg)
        })
    },
    updateAction (id, payload) {
      return new Promise ((resolve, reject) => {
        axios({
          method: 'put',
          url: `/products/${id}`,
          headers: {
            token: localStorage.getItem('token')
          },
          data: payload
        })
          .then(({data}) => {
            resolve(data.product)
          })
          .catch(reject)
      })
    },
    deleteAction (id) {
      return new Promise ((resolve, reject) => {
          axios({
            method: 'delete',
            url: `/products/${id}`,
            headers: {
              token: localStorage.getItem('token')
            }
          })
          .then(({data}) => {
            return this.$store.dispatch('checkSignIn')
          })
          .then(() => {
            resolve('product success deleted!')
          })
          .catch(err => {
            reject(err.response.data.msg)
          })
      })
    },
    deleteProduct (id) {
      let onOk = () => {
        this.$awn.asyncBlock(
          this.deleteAction(id),
          (msg) => this.$awn.success(msg),
          err => this.$awn.warning(err)
        )
      };
      let onCancel = () => this.$awn.warning('Your Product save now!');
      this.$awn.confirm(
        'are you sure?',
        onOk,
        onCancel
      )
      setTimeout(() => {
        this.$store.dispatch('fetchAllProduct ')
      }, 3500);
    }
  },
  computed: {
   price() {
     const number_string = this.getProduct.price.toString();
     const remainder = number_string.length % 3;
     let money = number_string.substr(0, remainder);
     const thousand = number_string.substr(remainder).match(/\d{3}/g);
     if (thousand) {
       const separator = remainder ? "." : "";
       money += separator + thousand.join(".");
     }
     return `Rp. ${money}`;
   }
  },
  watch: {
    getProduct: {
      handler (val) {
        if(val) {
          this.getProduct = val
        }
      }
    }
  },
  created () {
    // console.log(this.$route)
    // if(this.$route.name == 'wishlist')  {
    //   this.isWish = true;
    // }
  }
}
</script>

<style scoped> 
.LoopC {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.badgec2 {
  font-size: 10px;
  color: #41B549
}
.img {
  width: 12vw
}

.d-flex {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.align-center {
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.flex-centerY-centerX {
  justify-content: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

body {
  background-color: #f7f7f7;
}
.divTable {
  display: flex;
  justify-content: center;
}
/* td {
  display: inline-block;
} */
/* td:last-child{
  margin-left: 50px
} */
.page-wrapper {
  height: 100%;
  display: table;
}

.page-wrapper .page-inner {
  display: table-cell;
  vertical-align: middle;
}

.el-wrapper {
  width: 360px;
  padding: 15px;
  margin: 15px auto;
  background-color: #fff;
}

@media (max-width: 991px) {
  .el-wrapper {
    width: 345px;
  }
}

@media (max-width: 767px) {
  .el-wrapper {
    width: 290px;
    margin: 30px auto;
  }
}

.el-wrapper:hover .h-bg {
  left: 0px;
}

.el-wrapper:hover .price {
  left: 20px;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -o-transform: translateY(-50%);
  transform: translateY(-50%);
  color: #818181;
}

.el-wrapper:hover .add-to-cart {
  left: 50%;
}

.el-wrapper:hover .img {
  -o-filter: blur(7px);
  -ms-filter: blur(7px);
  filter: blur(7px);
  filter: progid:DXImageTransform.Microsoft.Blur(pixelradius='7', shadowopacity='0.0');
  opacity: 0.4;
}

.el-wrapper:hover .info-inner {
  bottom: 155px;
}

.el-wrapper:hover .a-size {
  -webkit-transition-delay: 300ms;
  -o-transition-delay: 300ms;
  transition-delay: 300ms;
  bottom: 50px;
  opacity: 1;
}

.el-wrapper .box-down {
  width: 100%;
  height: 60px;
  position: relative;
  overflow: hidden;
}

.el-wrapper .box-up {
  width: 100%;
  height: 300px;
  position: relative;
  overflow: hidden;
  text-align: center;
}

.el-wrapper .img {
  padding: 20px 0;
  -webkit-transition: all 800ms cubic-bezier(0, 0, 0.18, 1);
  -moz-transition: all 800ms cubic-bezier(0, 0, 0.18, 1);
  -o-transition: all 800ms cubic-bezier(0, 0, 0.18, 1);
  transition: all 800ms cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  -webkit-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -moz-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -o-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
}
.h-bg {
  -webkit-transition: all 800ms cubic-bezier(0, 0, 0.18, 1);
  -moz-transition: all 800ms cubic-bezier(0, 0, 0.18, 1);
  -o-transition: all 800ms cubic-bezier(0, 0, 0.18, 1);
  transition: all 800ms cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  -webkit-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -moz-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -o-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  width: 660px;
  height: 100%;
  background-color: #3f96cd;
  position: absolute;
  left: -659px;
}

.h-bg .h-bg-inner {
  width: 50%;
  height: 100%;
  background-color: #464646;
}

.info-inner {
  -webkit-transition: all 400ms cubic-bezier(0, 0, 0.18, 1);
  -moz-transition: all 400ms cubic-bezier(0, 0, 0.18, 1);
  -o-transition: all 400ms cubic-bezier(0, 0, 0.18, 1);
  transition: all 400ms cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  -webkit-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -moz-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -o-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  position: absolute;
  width: 100%;
  bottom: 25px;
}

.info-inner .p-name,
.info-inner .p-company {
  display: block;
}

.info-inner .p-name {
  font-family: 'PT Sans', sans-serif;
  font-size: 18px;
  color: #252525;
}

.info-inner .p-company {
  font-family: 'Lato', sans-serif;
  font-size: 12px;
  text-transform: uppercase;
  color: #8c8c8c;
}

.a-size {
  -webkit-transition: all 300ms cubic-bezier(0, 0, 0.18, 1);
  -moz-transition: all 300ms cubic-bezier(0, 0, 0.18, 1);
  -o-transition: all 300ms cubic-bezier(0, 0, 0.18, 1);
  transition: all 300ms cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  -webkit-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -moz-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -o-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  position: absolute;
  width: 100%;
  bottom: -20px;
  font-family: 'PT Sans', sans-serif;
  color: #828282;
  opacity: 0;
}

.a-size .size {
  color: #252525;
}

.cart {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  font-family: 'Lato', sans-serif;
  font-weight: 700;
}

.cart .price {
  -webkit-transition: all 600ms cubic-bezier(0, 0, 0.18, 1);
  -moz-transition: all 600ms cubic-bezier(0, 0, 0.18, 1);
  -o-transition: all 600ms cubic-bezier(0, 0, 0.18, 1);
  transition: all 600ms cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  -webkit-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -moz-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -o-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  -webkit-transition-delay: 100ms;
  -o-transition-delay: 100ms;
  transition-delay: 100ms;
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #252525;
}

.cart .add-to-cart {
  -webkit-transition: all 600ms cubic-bezier(0, 0, 0.18, 1);
  -moz-transition: all 600ms cubic-bezier(0, 0, 0.18, 1);
  -o-transition: all 600ms cubic-bezier(0, 0, 0.18, 1);
  transition: all 600ms cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  -webkit-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -moz-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  -o-transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  transition-timing-function: cubic-bezier(0, 0, 0.18, 1);
  /* ease-out */
  -webkit-transition-delay: 500ms;
  -o-transition-delay: 500ms;
  transition-delay: 500ms;
  display: block;
  position: absolute;
  top: 50%;
  left: 110%;
  -webkit-transform: translate(-50%, -24%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-5%, -50%);
}

.cart .add-to-cart .txt {
  font-size: 12px;
  color: #fff;
  letter-spacing: 0.045em;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>