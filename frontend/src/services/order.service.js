const API_URL = "http://localhost:8080/api";

export const orderService = {
  fetchMyOrders: async (token) => {
    const response = await fetch(`${API_URL}/orders/my`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error("Không thể tải đơn hàng");
    }
    const data = await response.json();
    return data.result; // ApiResponse.result
  },
  
  createOrder: async (orderData, token) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      throw new Error("Không thể tạo đơn hàng");
    }
    const data = await response.json();
    return data.result;
  }
};
