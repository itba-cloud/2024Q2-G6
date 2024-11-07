export default class ApiClientMock {
    constructor() {

    }
    async getProducts() {
      return {data: {
        "message": "Products retrieved successfully",
        "products": [
          {
            "id": 1,
            "name": "Product 1",
            "price": "29.99",
            "stock": 100,
            "description": "Description for Product 1",
            "image_url": "https://img.freepik.com/free-photo/organic-cosmetic-product-with-dreamy-aesthetic-fresh-background_23-2151382816.jpg?semt=ais_hybrid"
          },
          {
            "id": 2,
            "name": "Product 2",
            "price": "49.99",
            "stock": 50,
            "description": "Description for Product 2",
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D"
          }
        ]
      }}
    }
  
    async getBookings() {
        console.log('HOLA')
      return {
        data: {
            "message": "Bookings retrieved successfully",
            "products": [
              {
                "id": 1,
                "user_id": "119497619954",
                "product_id": 1,
                "quantity": 2,
                "reservation_date": "2024-11-06T22:03:03.792Z",
                "status": "PENDING"
              }
            ]
          }
      }
    }
  
    async addProduct(data) {
      return {data: {
        "message": "Succesfull product adding",
        "id": 3
      }}
    }
  
    async bookProduct(id, data) {
      return {
        data: {
            "message": "Succesfull booking of product"
          }
      }
    }
  
    async deleteProduct(id) {
      return {data: {
        "message": "Product deleted successfully"
      }}
    }
  
    async addImage(id, data) {
      return {
        data: {
            "message": "Image uploaded successfully",
            "imageUrl": "https://mycustomdomain3-my-item-images-bucket.s3.amazonaws.com/item-1.png"
          }
      }
    }
  
  }