import apiClient from "../common/apiClient";

class DeliveryService {
  // Tạo đơn giao hàng mới
  static async createDelivery(deliveryData) {
    try {
      const response = await apiClient.post("/delivery", deliveryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Lấy danh sách đơn giao hàng với filter và pagination
  static async getDeliveries(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          queryParams.append(key, params[key]);
        }
      });

      const response = await apiClient.get(
        `/delivery?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Lấy chi tiết đơn giao hàng
  static async getDeliveryById(deliveryId) {
    try {
      const response = await apiClient.get(`/delivery/${deliveryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Cập nhật đơn giao hàng
  static async updateDelivery(deliveryId, updateData) {
    try {
      const response = await apiClient.put(
        `/delivery/${deliveryId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Cập nhật trạng thái đơn giao hàng
  static async updateDeliveryStatus(deliveryId, status, note = "") {
    try {
      const response = await apiClient.patch(`/delivery/${deliveryId}/status`, {
        status,
        note,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Xóa đơn giao hàng (chỉ admin)
  static async deleteDelivery(deliveryId) {
    try {
      const response = await apiClient.delete(`/delivery/${deliveryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Lấy thống kê đơn giao hàng
  static async getDeliveryStats() {
    try {
      const response = await apiClient.get("/delivery/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Utility methods for frontend

  // Định dạng trạng thái giao hàng
  static getStatusText(status) {
    const statusMap = {
      PENDING: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      PICKED_UP: "Đã lấy hàng",
      IN_TRANSIT: "Đang vận chuyển",
      OUT_FOR_DELIVERY: "Đang giao hàng",
      DELIVERED: "Đã giao hàng",
      RETURNED: "Hoàn trả",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  }

  // Lấy màu badge cho trạng thái
  static getStatusColor(status) {
    const colorMap = {
      PENDING: "warning",
      CONFIRMED: "info",
      PICKED_UP: "primary",
      IN_TRANSIT: "primary",
      OUT_FOR_DELIVERY: "warning",
      DELIVERED: "success",
      RETURNED: "danger",
      CANCELLED: "secondary",
    };
    return colorMap[status] || "secondary";
  }

  // Định dạng phương thức vận chuyển
  static getTransportMethodText(method) {
    const methodMap = {
      STANDARD: "Tiêu chuẩn",
      EXPRESS: "Nhanh",
      SUPER_EXPRESS: "Siêu nhanh",
      SAME_DAY: "Trong ngày",
    };
    return methodMap[method] || method;
  }

  // Định dạng phương thức thanh toán
  static getPaymentMethodText(method) {
    const methodMap = {
      SENDER_PAY: "Người gửi trả",
      RECEIVER_PAY: "Người nhận trả",
      COD: "Thu hộ",
    };
    return methodMap[method] || method;
  }

  // Định dạng số tiền
  static formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  // Định dạng ngày tháng
  static formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Kiểm tra xem có thể chỉnh sửa đơn không
  static canEditDelivery(status) {
    return ["PENDING", "CONFIRMED"].includes(status);
  }

  // Kiểm tra xem có thể hủy đơn không
  static canCancelDelivery(status) {
    return ["PENDING", "CONFIRMED", "PICKED_UP"].includes(status);
  }

  // Lấy các trạng thái có thể chuyển đổi
  static getAvailableStatusTransitions(currentStatus) {
    const transitions = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PICKED_UP", "CANCELLED"],
      PICKED_UP: ["IN_TRANSIT", "RETURNED"],
      IN_TRANSIT: ["OUT_FOR_DELIVERY", "RETURNED"],
      OUT_FOR_DELIVERY: ["DELIVERED", "RETURNED"],
      DELIVERED: [],
      RETURNED: [],
      CANCELLED: [],
    };
    return transitions[currentStatus] || [];
  }

  // Validate dữ liệu đơn giao hàng
  static validateDeliveryData(data) {
    const errors = [];

    if (!data.orderCode?.trim()) {
      errors.push("Mã đơn hàng không được để trống");
    }

    if (!data.senderInfo?.name?.trim()) {
      errors.push("Tên người gửi không được để trống");
    }

    if (!data.senderInfo?.phone?.trim()) {
      errors.push("Số điện thoại người gửi không được để trống");
    }

    if (!data.senderInfo?.address?.trim()) {
      errors.push("Địa chỉ người gửi không được để trống");
    }

    if (!data.receiverInfo?.name?.trim()) {
      errors.push("Tên người nhận không được để trống");
    }

    if (!data.receiverInfo?.phone?.trim()) {
      errors.push("Số điện thoại người nhận không được để trống");
    }

    if (!data.receiverInfo?.address?.trim()) {
      errors.push("Địa chỉ người nhận không được để trống");
    }

    if (!data.deliveryInfo?.weight || data.deliveryInfo.weight <= 0) {
      errors.push("Khối lượng phải lớn hơn 0");
    }

    if (!data.deliveryInfo?.value || data.deliveryInfo.value <= 0) {
      errors.push("Giá trị hàng hóa phải lớn hơn 0");
    }

    if (!data.expectedDeliveryDate) {
      errors.push("Ngày giao dự kiến không được để trống");
    }

    return errors;
  }
}

export default DeliveryService;
