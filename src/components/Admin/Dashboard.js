import React, { useEffect, useState } from "react";
import { Users, Activity, ShoppingCart, FileText } from "lucide-react";
import { totalAssessments } from "../../services/AssessmentService";
import { totalUsers } from "../../services/UserService";
import { totalExams } from "../../services/ExamService";
import { toast } from "react-toastify";
import { DocumentScanner } from "@mui/icons-material";

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`bg-white shadow-md rounded-lg p-5 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <Icon
        className={`w-10 h-10 ${color.replace(
          "border-l-4",
          "text-opacity-70"
        )}`}
      />
    </div>
  </div>
);

export default function Dashboard() {
  const [totalData, setTotalData] = useState({
    totalAssessments: 0,
    totalUsers: 0,
    totalExams: 0,
  });
  const handleFetch = async () => {
    try {
      const resTotalAssessments = await totalAssessments();
      const resTotalUsers = await totalUsers();
      const resTotalExams = await totalExams();
      setTotalData({
        totalAssessments: resTotalAssessments?.data,
        totalUsers: resTotalUsers?.data,
        totalExams: resTotalExams?.data,
      });
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);
  return (
    <div className="p-[30px] overflow-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Users"
          value={totalData?.totalUsers}
          color="border-blue-500"
        />
        <StatCard
          icon={FileText}
          title="Total Exams"
          value={totalData?.totalExams}
          color="border-green-500"
        />
        <StatCard
          icon={DocumentScanner}
          title="Total Assessments"
          value={totalData?.totalAssessments}
          color="border-purple-500"
        />
      </div>

      {/* <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            {
              user: "John Doe",
              action: "Updated profile",
              time: "2 mins ago",
            },
            {
              user: "Jane Smith",
              action: "Made a purchase",
              time: "1 hour ago",
            },
            {
              user: "Mike Johnson",
              action: "Logged in",
              time: "3 hours ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b pb-3 last:border-b-0"
            >
              <div>
                <p className="font-medium text-gray-800">{activity.user}</p>
                <p className="text-sm text-gray-500">{activity.action}</p>
              </div>
              <span className="text-sm text-gray-500 manrope-font">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
