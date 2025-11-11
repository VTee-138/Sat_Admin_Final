import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import LoginForm from "./components/Auth/LoginForm";
import Home from "./components/Admin/Home";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        {/* <Route path="/exam-papers" element={<ExamPapersComponent />} />
        <Route
          path="exam-papers/detail/:examId"
          element={<ExecuteTestComponent />}
        />
        <Route
          path="/practice-exercises"
          element={<PracticeExercisesComponent />}
        />
        <Route
          path="exam-papers/view-selected-answer/:examId"
          element={<ViewSelectedAnswer />}
        /> */}

        {/* <Route path="/user-ranks" element={<ViewRankUsers />} />
        <Route path="/account-info" element={<AccountInfo />} /> */}
      </Route>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>
    </Route>
  )
);
function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
