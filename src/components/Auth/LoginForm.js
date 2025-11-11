import { useState } from "react";
import "./Login.scss";
import { Button, Stack } from "@mui/material";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../../services/AuthService";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FilledInput from "@mui/material/FilledInput";
import EmailIcon from "@mui/icons-material/Email";
import logo from "../../images/logo.jpg";
import LoginIcon from "@mui/icons-material/Login";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home";
  const [loading, setLoading] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };
  const validate = () => {
    if (!email) {
      toast.error("Vui lòng điền thông tin email.");
      return false;
    }

    if (!password) {
      toast.error("Vui lòng điền thông tin mật khẩu.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }
    try {
      // setLoading(true);
      const response = await login({
        email,
        password,
      });
      if (response && response.token) {
        const { token } = response;
        if (token) {
          localStorage.setItem("jwt", JSON.stringify({ token }));
          navigate(from, { replace: true });
        } else {
          toast.error("Lỗi không mong muốn trong quá trình xử lý đăng nhập");
        }
      }
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <form className="login100-form validate-form" onSubmit={handleSubmit}>
            <Stack className="login100-form-title p-b-26 text-gray-700 font-extrabold mb-5">
              Đăng Nhập 10SAT
            </Stack>
            <span className="login100-form-title p-b-48">
              <i className="zmdi zmdi-font"></i>
            </span>
            <div className="mb-5">
              <img src={logo} className="w-40 h-30 m-auto"></img>
            </div>
            <FormControl
              sx={{ width: "100%" }}
              variant="filled"
              className="mb-5"
            >
              <InputLabel htmlFor="filled-adornment-email">Email</InputLabel>
              <FilledInput
                id="filled-adornment-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                endAdornment={<EmailIcon />}
              />
            </FormControl>

            <FormControl sx={{ width: "100%" }} variant="filled">
              <InputLabel htmlFor="filled-adornment-password">
                Mật khẩu
              </InputLabel>
              <FilledInput
                id="filled-adornment-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword
                          ? "hide the password"
                          : "display the password"
                      }
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <div className="container-login100-form-btn">
              <Button
                variant="contained"
                className="py-[12px]"
                onClick={handleSubmit}
                startIcon={<LoginIcon />}
              >
                Đăng nhập
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
