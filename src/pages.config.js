import Home from './pages/Home';
import BrowseServices from './pages/BrowseServices';
import BusinessProfile from './pages/BusinessProfile';
import CustomerDashboard from './pages/CustomerDashboard';
import BusinessOnboarding from './pages/BusinessOnboarding';
import BusinessDashboard from './pages/BusinessDashboard';
import EditBusiness from './pages/EditBusiness';
import Rewards from './pages/Rewards';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BrowseServices": BrowseServices,
    "BusinessProfile": BusinessProfile,
    "CustomerDashboard": CustomerDashboard,
    "BusinessOnboarding": BusinessOnboarding,
    "BusinessDashboard": BusinessDashboard,
    "EditBusiness": EditBusiness,
    "Rewards": Rewards,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};