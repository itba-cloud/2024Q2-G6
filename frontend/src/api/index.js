import axios from "axios";
import { API_BASE } from "src/constants";


const axiosInstance = axios.create({
  baseURL: API_BASE, // Set your backend API base URL here
});

// Interceptor to add the JWT token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken'); // Retrieve the token from local storage

  if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Set the Bearer token
  }

  return config; // Return the updated config
}, (error) => {
  return Promise.reject(error); // Handle the error
});


class ApiClient {

  static async request(method, path, body, headers) {
    try {
      const response = await axiosInstance({
        method,
        url: `${path}`,
        headers: headers ? headers : {"Content-Type": "application/json"},
        data: body,
      });
      return { error: false, data: response.data };
    } catch (error) {
      console.error(error);
      return { error: true, data: { message: error.message } };
    }
  }

  static async getProducts() {
    return await this.request("GET", "/products");
  }

  static async getBookings() {
    return await this.request("GET", "/bookings");
  }

  static async addProduct(data) {
    return await this.request("POST", `/products`, data);
  }

  static async bookProduct(id, data) {
    return await this.request("POST", `/products/${id}/bookings`, data);
  }

  static async deleteProduct(id) {
    return await this.request("DELETE", `/products/${id}`);
  }

  static async addImage(id, data) {
    return await this.request("PUT", `/products/${id}/image`, data,  {"Content-Type": "multipart/form-data"});
  }

}

export default ApiClient;
