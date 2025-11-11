import React, { useState, useEffect } from "react";
import DeliveryService from "../../services/DeliveryService";

const DeliveryForm = ({ onSuccess, onCancel, editingDelivery = null }) => {
  const [formData, setFormData] = useState({
    orderCode: "",
    senderInfo: {
      name: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      province: "",
    },
    receiverInfo: {
      name: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      province: "",
    },
    deliveryInfo: {
      weight: "",
      dimensions: {
        length: "",
        width: "",
        height: "",
      },
      quantity: 1,
      description: "",
      value: "",
    },
    transportMethod: "STANDARD",
    paymentMethod: "SENDER_PAY",
    codAmount: 0,
    shippingFee: "",
    expectedDeliveryDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (editingDelivery) {
      setFormData({
        ...editingDelivery,
        expectedDeliveryDate: editingDelivery.expectedDeliveryDate
          ? new Date(editingDelivery.expectedDeliveryDate)
              .toISOString()
              .split("T")[0]
          : "",
      });
    }
  }, [editingDelivery]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData((prev) => ({
      ...prev,
      deliveryInfo: {
        ...prev.deliveryInfo,
        dimensions: {
          ...prev.deliveryInfo.dimensions,
          [dimension]: value,
        },
      },
    }));
  };

  const calculateShippingFee = () => {
    // Logic tính phí ship đơn giản
    const weight = parseFloat(formData.deliveryInfo.weight) || 0;
    const basePrice = 30000; // 30k cơ bản
    const weightPrice = Math.max(0, weight - 0.5) * 5000; // 5k/kg từ 0.5kg trở lên

    let methodMultiplier = 1;
    switch (formData.transportMethod) {
      case "EXPRESS":
        methodMultiplier = 1.5;
        break;
      case "SUPER_EXPRESS":
        methodMultiplier = 2;
        break;
      case "SAME_DAY":
        methodMultiplier = 3;
        break;
      default:
        methodMultiplier = 1;
    }

    const totalFee = (basePrice + weightPrice) * methodMultiplier;
    setFormData((prev) => ({
      ...prev,
      shippingFee: Math.round(totalFee),
    }));
  };

  useEffect(() => {
    if (formData.deliveryInfo.weight && formData.transportMethod) {
      calculateShippingFee();
    }
  }, [formData.deliveryInfo.weight, formData.transportMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Validate
      const validationErrors = DeliveryService.validateDeliveryData(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Submit
      let response;
      if (editingDelivery) {
        response = await DeliveryService.updateDelivery(
          editingDelivery._id,
          formData
        );
      } else {
        response = await DeliveryService.createDelivery(formData);
      }

      if (response.data) {
        onSuccess?.(response.data.delivery);
      }
    } catch (error) {
      setErrors([error.message || "Có lỗi xảy ra"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingDelivery
              ? "Cập nhật đơn giao hàng"
              : "Tạo đơn giao hàng mới"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-800 font-medium mb-2">
                Vui lòng kiểm tra lại:
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Thông tin đơn hàng */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              Thông tin đơn hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã đơn hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.orderCode}
                  onChange={(e) =>
                    handleInputChange(null, "orderCode", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mã đơn hàng"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày giao dự kiến <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) =>
                    handleInputChange(
                      null,
                      "expectedDeliveryDate",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Thông tin người gửi */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Thông tin người gửi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.senderInfo.name}
                  onChange={(e) =>
                    handleInputChange("senderInfo", "name", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập họ tên người gửi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.senderInfo.phone}
                  onChange={(e) =>
                    handleInputChange("senderInfo", "phone", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.senderInfo.address}
                  onChange={(e) =>
                    handleInputChange("senderInfo", "address", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập địa chỉ chi tiết"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phường/Xã
                </label>
                <input
                  type="text"
                  value={formData.senderInfo.ward}
                  onChange={(e) =>
                    handleInputChange("senderInfo", "ward", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Phường/Xã"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={formData.senderInfo.district}
                  onChange={(e) =>
                    handleInputChange("senderInfo", "district", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Quận/Huyện"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  value={formData.senderInfo.province}
                  onChange={(e) =>
                    handleInputChange("senderInfo", "province", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Tỉnh/Thành phố"
                />
              </div>
            </div>
          </div>

          {/* Thông tin người nhận */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              Thông tin người nhận
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.receiverInfo.name}
                  onChange={(e) =>
                    handleInputChange("receiverInfo", "name", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nhập họ tên người nhận"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.receiverInfo.phone}
                  onChange={(e) =>
                    handleInputChange("receiverInfo", "phone", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.receiverInfo.address}
                  onChange={(e) =>
                    handleInputChange("receiverInfo", "address", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nhập địa chỉ chi tiết"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phường/Xã
                </label>
                <input
                  type="text"
                  value={formData.receiverInfo.ward}
                  onChange={(e) =>
                    handleInputChange("receiverInfo", "ward", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Phường/Xã"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={formData.receiverInfo.district}
                  onChange={(e) =>
                    handleInputChange(
                      "receiverInfo",
                      "district",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Quận/Huyện"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố
                </label>
                <input
                  type="text"
                  value={formData.receiverInfo.province}
                  onChange={(e) =>
                    handleInputChange(
                      "receiverInfo",
                      "province",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tỉnh/Thành phố"
                />
              </div>
            </div>
          </div>

          {/* Thông tin hàng hóa */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">
              Thông tin hàng hóa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khối lượng (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.deliveryInfo.weight}
                  onChange={(e) =>
                    handleInputChange("deliveryInfo", "weight", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.deliveryInfo.quantity}
                  onChange={(e) =>
                    handleInputChange(
                      "deliveryInfo",
                      "quantity",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deliveryInfo.value}
                  onChange={(e) =>
                    handleInputChange("deliveryInfo", "value", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả hàng hóa
                </label>
                <textarea
                  value={formData.deliveryInfo.description}
                  onChange={(e) =>
                    handleInputChange(
                      "deliveryInfo",
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows="3"
                  placeholder="Mô tả chi tiết về hàng hóa..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiều dài (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deliveryInfo.dimensions.length}
                  onChange={(e) =>
                    handleDimensionChange("length", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiều rộng (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deliveryInfo.dimensions.width}
                  onChange={(e) =>
                    handleDimensionChange("width", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.deliveryInfo.dimensions.height}
                  onChange={(e) =>
                    handleDimensionChange("height", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Thông tin vận chuyển */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-teal-800 mb-4">
              Thông tin vận chuyển
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức vận chuyển
                </label>
                <select
                  value={formData.transportMethod}
                  onChange={(e) =>
                    handleInputChange(null, "transportMethod", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="STANDARD">Tiêu chuẩn</option>
                  <option value="EXPRESS">Nhanh</option>
                  <option value="SUPER_EXPRESS">Siêu nhanh</option>
                  <option value="SAME_DAY">Trong ngày</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình thức thanh toán
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    handleInputChange(null, "paymentMethod", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="SENDER_PAY">Người gửi trả</option>
                  <option value="RECEIVER_PAY">Người nhận trả</option>
                  <option value="COD">Thu hộ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phí vận chuyển (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.shippingFee}
                  onChange={(e) =>
                    handleInputChange(null, "shippingFee", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-100"
                  placeholder="Tự động tính"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền thu hộ (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.codAmount}
                  onChange={(e) =>
                    handleInputChange(null, "codAmount", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="0"
                  disabled={formData.paymentMethod !== "COD"}
                />
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange(null, "notes", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Ghi chú thêm cho đơn hàng..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              disabled={loading}
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {editingDelivery ? "Cập nhật" : "Tạo giao hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;
