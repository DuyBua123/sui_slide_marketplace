import { Home } from "../pages/home";
import { NotFound } from "../pages/notfound";
import { Market } from "../pages/market";
import { SignIn } from "../pages/signin";
import { Slide } from "../pages/slide";
import { MarketDetail } from "../pages/marketDetail";
import { MySlide } from "../pages/mySlide";
import { Editor } from "../pages/editor/Editor";
import { ROUTE } from "../constant/routeConfig";
import WalletDashboard from "../pages/WalletDashboard";
import { PaymentSuccess } from "../pages/paymentSuccess";
import { TetEventPage } from "../pages/TetEventPage";
import { Terms } from "../pages/terms";

export const publicRoutes = [
  { path: ROUTE.HOME, component: MySlide }, //
  { path: "/home", component: Home },
  { path: ROUTE.MARKET, component: Market }, // trang market
  { path: `${ROUTE.MARKET_DETAIL}/:id`, component: MarketDetail }, // trang thông tin chi tiết sản phầm/slide
  { path: ROUTE.SIGN_IN, component: SignIn, isHeaderFooter: false }, // trang đăng nhập
  { path: `${ROUTE.SLIDE}/:id`, component: Slide, isHeaderFooter: false }, // trang xem slide (presentation) - public
  { path: "/tet-event", component: TetEventPage }, // Tet Lunar New Year Event Page
  { path: ROUTE.TERMS, component: Terms }, // trang điều khoản & dịch vụ
  // { path: "/sign-up", component: SignUp, isHeaderFooter: false }, // trang đăng ký
  { path: "*", component: NotFound, isHeaderFooter: false }, // trang not found
];

export const privateRoutes = [
  { path: "/editor", component: Editor, isHeaderFooter: false }, // trang tạo slide mới
  { path: "/editor/:id", component: Editor, isHeaderFooter: false }, // trang chỉnh sửa slide
  { path: "/my-slide", component: MySlide }, // trang xem slide sở hữu
  { path: `${ROUTE.SLIDE}/:id`, component: Slide, isHeaderFooter: false }, // trang chỉnh sửa slide
  { path: ROUTE.MYSLIDE, component: Home }, // trang xem slide sở hữu
  { path: ROUTE.DASHBOARD, component: WalletDashboard }, // trang dashboard
  { path: "/payment-success", component: PaymentSuccess, isHeaderFooter: false },
];
