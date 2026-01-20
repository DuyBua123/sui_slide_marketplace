import { Home } from "../pages/home";
import { NotFound } from "../pages/notfound";
import { Market } from "../pages/market";
import { SignIn } from "../pages/signin";
import { SignUp } from "../pages/signup";
import { Slide } from "../pages/slide";
import { MarketDetail } from "../pages/marketDetail";
import { MySlide } from "../pages/mySlide";

export const publicRoutes = [
  { path: "/", component: Home }, // trang chủ
  { path: "/market", component: Market }, // trang market
  { path: "/market/:id", component: MarketDetail }, // trang thông tin chi tiết sản phầm/slide
  { path: "/sign-in", component: SignIn, isHeaderFooter: false }, // trang đăng nhập
  // { path: "/sign-up", component: SignUp, isHeaderFooter: false }, // trang đăng ký
  { path: "*", component: NotFound, isHeaderFooter: false }, // trang not found
];

export const privateRoutes = [
  { path: "/slide/:id", component: Slide, isHeaderFooter: false }, // trang tạo, chỉnh sửa slide
  { path: "/my-slide", component: MySlide }, // trang xem slide sở hữu
];
