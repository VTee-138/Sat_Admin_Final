import React, { useState, useEffect } from "react";
import DeliveryService from "../../services/DeliveryService";
import DeliveryForm from "./DeliveryForm";
import ConfirmationDialog from "./ConfirmationDialog";

const DeliveryList = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    transportMethod: "",
    paymentMethod: "",
    fromDate: "",
    toDate: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);

  // State cho confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  useEffect(() => {
    loadDeliveries();
  }, [pagination.page, filters]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await DeliveryService.getDeliveries(params);
      setDeliveries(response.data.deliveries);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateSuccess = (newDelivery) => {
    setShowForm(false);
    setEditingDelivery(null);
    loadDeliveries();
  };

  const handleEdit = (delivery) => {
    setEditingDelivery(delivery);
    setShowForm(true);
  };

  const handleStatusUpdate = async (deliveryId, newStatus, note = "") => {
    try {
      await DeliveryService.updateDeliveryStatus(deliveryId, newStatus, note);
      loadDeliveries();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (deliveryId) => {
    setDeleteItemId(deliveryId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDelivery = async () => {
    try {
      await DeliveryService.deleteDelivery(deleteItemId);
      loadDeliveries();
    } catch (error) {
      console.error("Error deleting delivery:", error);
      alert("Không thể xóa đơn giao hàng. Vui lòng thử lại.");
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDeliveries(deliveries.map((d) => d._id));
    } else {
      setSelectedDeliveries([]);
    }
  };

  const handleSelectOne = (deliveryId, checked) => {
    if (checked) {
      setSelectedDeliveries((prev) => [...prev, deliveryId]);
    } else {
      setSelectedDeliveries((prev) => prev.filter((id) => id !== deliveryId));
    }
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      transportMethod: "",
      paymentMethod: "",
      fromDate: "",
      toDate: "",
    });
  };

  const exportToExcel = () => {
    // Placeholder for export functionality
    alert("Chức năng xuất Excel sẽ được triển khai sau!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý giao hàng
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Xuất excel
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tạo giao hàng
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600">
          <span>Trang chủ</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">Quản lý giao hàng</span>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Mã vận đơn"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Mã đơn hàng"
              value={filters.orderCode}
              onChange={(e) => handleFilterChange("orderCode", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PICKED_UP">Đã lấy hàng</option>
              <option value="IN_TRANSIT">Đang vận chuyển</option>
              <option value="OUT_FOR_DELIVERY">Đang giao hàng</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="RETURNED">Hoàn trả</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <div>
            <select
              value={filters.transportMethod}
              onChange={(e) =>
                handleFilterChange("transportMethod", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Loại kiện hàng</option>
              <option value="STANDARD">Tiêu chuẩn</option>
              <option value="EXPRESS">Nhanh</option>
              <option value="SUPER_EXPRESS">Siêu nhanh</option>
              <option value="SAME_DAY">Trong ngày</option>
            </select>
          </div>
          <div>
            <select
              value={filters.paymentMethod}
              onChange={(e) =>
                handleFilterChange("paymentMethod", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Kho nhận</option>
              <option value="SENDER_PAY">Người gửi trả</option>
              <option value="RECEIVER_PAY">Người nhận trả</option>
              <option value="COD">Thu hộ</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Kết quả tìm được:{" "}
            <span className="font-medium text-blue-600">
              {pagination.total} kiện
            </span>
          </p>
          <div className="flex space-x-4">
            <input
              type="date"
              placeholder="Từ ngày"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              placeholder="Đến ngày"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={
                      selectedDeliveries.length === deliveries.length &&
                      deliveries.length > 0
                    }
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">STT</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Mã giao hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Thông tin giao hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Ngày giao
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Hàng VC
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  HTTT
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Tác vụ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-600"
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
                      <span className="ml-2 text-gray-600">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery, index) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDeliveries.includes(delivery._id)}
                        onChange={(e) =>
                          handleSelectOne(delivery._id, e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {DeliveryService.formatDate(delivery.createdDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-blue-600">
                        {delivery.deliveryCode}
                      </div>
                      <div className="text-xs text-gray-500">
                        {delivery.orderCode}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${DeliveryService.getStatusColor(
                          delivery.status
                        )}-100 text-${DeliveryService.getStatusColor(
                          delivery.status
                        )}-800`}
                      >
                        {DeliveryService.getStatusText(delivery.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.senderInfo.name} →{" "}
                        {delivery.receiverInfo.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {delivery.senderInfo.phone} →{" "}
                        {delivery.receiverInfo.phone}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Khối lượng: {delivery.deliveryInfo.weight}kg | Giá trị:{" "}
                        {DeliveryService.formatCurrency(
                          delivery.deliveryInfo.value
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>
                        DK:{" "}
                        {DeliveryService.formatDate(
                          delivery.expectedDeliveryDate
                        )}
                      </div>
                      {delivery.actualDeliveryDate && (
                        <div className="text-green-600">
                          TT:{" "}
                          {DeliveryService.formatDate(
                            delivery.actualDeliveryDate
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {DeliveryService.getTransportMethodText(
                          delivery.transportMethod
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {DeliveryService.formatCurrency(delivery.shippingFee)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {DeliveryService.getPaymentMethodText(
                        delivery.paymentMethod
                      )}
                      {delivery.codAmount > 0 && (
                        <div className="text-xs text-orange-600">
                          COD:{" "}
                          {DeliveryService.formatCurrency(delivery.codAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const headings = document.querySelectorAll("h2");

                            // Duyệt tìm h2 có nội dung đúng
                            for (const h2 of headings) {
                              if (
                                h2.textContent.trim() ===
                                "Cập nhật thông tin thư mục"
                              ) {
                                h2.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                                break;
                              }
                            }
                            handleEdit(delivery);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        {/* Status Update Dropdown */}
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleStatusUpdate(delivery._id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Cập nhật trạng thái</option>
                          {DeliveryService.getAvailableStatusTransitions(
                            delivery.status
                          ).map((status) => (
                            <option key={status} value={status}>
                              {DeliveryService.getStatusText(status)}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleDelete(delivery._id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Xóa"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              của {pagination.total} kết quả
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setPagination((prev) => ({ ...prev, page }))}
                    className={`px-3 py-1 border rounded text-sm ${
                      pagination.page === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <DeliveryForm
          editingDelivery={editingDelivery}
          onSuccess={handleCreateSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingDelivery(null);
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteDelivery}
        title="Xác nhận xóa đơn giao hàng"
        message="Bạn có chắc chắn muốn xóa đơn giao hàng này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default DeliveryList;
